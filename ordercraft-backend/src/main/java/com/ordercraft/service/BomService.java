package com.ordercraft.service;

import com.ordercraft.dto.mapper.EntityMapper;
import com.ordercraft.dto.request.CreateBomRequest;
import com.ordercraft.dto.response.BomResponse;
import com.ordercraft.entity.BillOfMaterial;
import com.ordercraft.entity.BomItem;
import com.ordercraft.entity.Product;
import com.ordercraft.entity.RawMaterial;
import com.ordercraft.enums.BomStatus;
import com.ordercraft.exception.BusinessException;
import com.ordercraft.exception.ResourceNotFoundException;
import com.ordercraft.repository.BillOfMaterialRepository;
import com.ordercraft.repository.ProductRepository;
import com.ordercraft.repository.RawMaterialRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class BomService {

    private final BillOfMaterialRepository bomRepository;
    private final ProductRepository productRepository;
    private final RawMaterialRepository rawMaterialRepository;

    public BomService(BillOfMaterialRepository bomRepository,
                      ProductRepository productRepository,
                      RawMaterialRepository rawMaterialRepository) {
        this.bomRepository = bomRepository;
        this.productRepository = productRepository;
        this.rawMaterialRepository = rawMaterialRepository;
    }

    @Transactional(readOnly = true)
    public List<BomResponse> getAllBoms(BomStatus status) {
        List<BillOfMaterial> boms = (status != null)
                ? bomRepository.findAll().stream().filter(b -> b.getStatus() == status).collect(Collectors.toList())
                : bomRepository.findAll();

        return boms.stream().map(EntityMapper::toBomResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public BomResponse getBomById(Long id) {
        BillOfMaterial bom = bomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("BOM not found with id: " + id));
        return EntityMapper.toBomResponse(bom);
    }

    @Transactional(readOnly = true)
    public List<BomResponse> getBomsByProductId(Long productId) {
        return bomRepository.findByProductId(productId).stream()
                .map(EntityMapper::toBomResponse)
                .collect(Collectors.toList());
    }

    public BomResponse createBom(CreateBomRequest request) {
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + request.getProductId()));

        BillOfMaterial bom = new BillOfMaterial();
        bom.setProduct(product);
        bom.setVersion(request.getVersion());
        bom.setStatus(BomStatus.DRAFT);
        bom.setEffectiveDate(request.getEffectiveDate() != null ? request.getEffectiveDate() : LocalDate.now());
        bom.setNotes(request.getNotes());

        List<BomItem> items = new ArrayList<>();
        for (CreateBomRequest.BomItemRequest itemReq : request.getItems()) {
            RawMaterial rawMaterial = rawMaterialRepository.findById(itemReq.getRawMaterialId())
                    .orElseThrow(() -> new ResourceNotFoundException("Raw material not found with id: " + itemReq.getRawMaterialId()));

            BomItem item = new BomItem();
            item.setBillOfMaterial(bom);
            item.setRawMaterial(rawMaterial);
            item.setQuantityRequired(itemReq.getQuantityRequired());
            item.setUnitOfMeasure(itemReq.getUnitOfMeasure() != null ? itemReq.getUnitOfMeasure() : rawMaterial.getUnitOfMeasure());
            item.setScrapFactor(itemReq.getScrapFactor() != null ? itemReq.getScrapFactor() : BigDecimal.ZERO);
            items.add(item);
        }
        bom.setItems(items);

        BillOfMaterial saved = bomRepository.save(bom);
        return EntityMapper.toBomResponse(saved);
    }

    public BomResponse updateBom(Long id, CreateBomRequest request) {
        BillOfMaterial bom = bomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("BOM not found with id: " + id));

        if (bom.getStatus() == BomStatus.ACTIVE) {
            throw new BusinessException("Cannot modify an ACTIVE Bill of Materials. Create a new version instead.");
        }

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + request.getProductId()));

        bom.setProduct(product);
        bom.setVersion(request.getVersion());
        bom.setEffectiveDate(request.getEffectiveDate() != null ? request.getEffectiveDate() : bom.getEffectiveDate());
        bom.setNotes(request.getNotes());

        bom.getItems().clear();
        for (CreateBomRequest.BomItemRequest itemReq : request.getItems()) {
            RawMaterial rawMaterial = rawMaterialRepository.findById(itemReq.getRawMaterialId())
                    .orElseThrow(() -> new ResourceNotFoundException("Raw material not found with id: " + itemReq.getRawMaterialId()));

            BomItem item = new BomItem();
            item.setBillOfMaterial(bom);
            item.setRawMaterial(rawMaterial);
            item.setQuantityRequired(itemReq.getQuantityRequired());
            item.setUnitOfMeasure(itemReq.getUnitOfMeasure() != null ? itemReq.getUnitOfMeasure() : rawMaterial.getUnitOfMeasure());
            item.setScrapFactor(itemReq.getScrapFactor() != null ? itemReq.getScrapFactor() : BigDecimal.ZERO);
            bom.getItems().add(item);
        }

        BillOfMaterial updated = bomRepository.save(bom);
        return EntityMapper.toBomResponse(updated);
    }

    public BomResponse activateBom(Long id) {
        BillOfMaterial bom = bomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("BOM not found with id: " + id));

        // Mark previously active BOM for this product to OBSOLETE
        bomRepository.findByProductIdAndStatus(bom.getProduct().getId(), BomStatus.ACTIVE)
                .ifPresent(existingActive -> {
                    if (!existingActive.getId().equals(bom.getId())) {
                        existingActive.setStatus(BomStatus.OBSOLETE);
                        bomRepository.save(existingActive);
                    }
                });

        bom.setStatus(BomStatus.ACTIVE);
        BillOfMaterial updated = bomRepository.save(bom);
        return EntityMapper.toBomResponse(updated);
    }

    public void deleteBom(Long id) {
        BillOfMaterial bom = bomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("BOM not found with id: " + id));

        if (bom.getStatus() == BomStatus.ACTIVE) {
            throw new BusinessException("Cannot delete an ACTIVE BOM.");
        }
        bomRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> explodeBom(Long bomId, BigDecimal orderQuantity) {
        BillOfMaterial bom = bomRepository.findById(bomId)
                .orElseThrow(() -> new ResourceNotFoundException("BOM not found with id: " + bomId));

        return calculateExplosion(bom, orderQuantity);
    }

    public List<Map<String, Object>> calculateExplosion(BillOfMaterial bom, BigDecimal orderQuantity) {
        List<Map<String, Object>> explosion = new ArrayList<>();

        for (BomItem item : bom.getItems()) {
            RawMaterial rm = item.getRawMaterial();
            BigDecimal baseQty = item.getQuantityRequired().multiply(orderQuantity);
            BigDecimal scrapPercent = item.getScrapFactor() != null ? item.getScrapFactor() : BigDecimal.ZERO;
            BigDecimal scrapMultiplier = BigDecimal.ONE.add(scrapPercent.divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP));
            BigDecimal totalRequired = baseQty.multiply(scrapMultiplier).setScale(2, RoundingMode.HALF_UP);
            BigDecimal currentStock = rm.getStockQuantity() != null ? rm.getStockQuantity() : BigDecimal.ZERO;
            BigDecimal shortage = totalRequired.subtract(currentStock).max(BigDecimal.ZERO);

            Map<String, Object> materialData = new LinkedHashMap<>();
            materialData.put("rawMaterialId", rm.getId());
            materialData.put("rawMaterialName", rm.getName());
            materialData.put("sku", rm.getSku());
            materialData.put("unitOfMeasure", item.getUnitOfMeasure());
            materialData.put("quantityPerUnit", item.getQuantityRequired());
            materialData.put("orderQuantity", orderQuantity);
            materialData.put("scrapFactorPercent", scrapPercent);
            materialData.put("totalRequired", totalRequired);
            materialData.put("currentStock", currentStock);
            materialData.put("shortage", shortage);
            materialData.put("unitCost", rm.getUnitCost());
            materialData.put("totalCost", totalRequired.multiply(rm.getUnitCost()).setScale(2, RoundingMode.HALF_UP));
            if (rm.getSupplier() != null) {
                materialData.put("supplierId", rm.getSupplier().getId());
                materialData.put("supplierName", rm.getSupplier().getName());
            }

            explosion.add(materialData);
        }
        return explosion;
    }
}
