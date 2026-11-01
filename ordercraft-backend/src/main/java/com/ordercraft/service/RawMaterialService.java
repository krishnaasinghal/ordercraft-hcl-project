package com.ordercraft.service;

import com.ordercraft.dto.mapper.EntityMapper;
import com.ordercraft.dto.request.CreateRawMaterialRequest;
import com.ordercraft.dto.response.RawMaterialResponse;
import com.ordercraft.entity.RawMaterial;
import com.ordercraft.entity.Supplier;
import com.ordercraft.exception.BusinessException;
import com.ordercraft.exception.ResourceNotFoundException;
import com.ordercraft.repository.RawMaterialRepository;
import com.ordercraft.repository.SupplierRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class RawMaterialService {

    private final RawMaterialRepository rawMaterialRepository;
    private final SupplierRepository supplierRepository;

    public RawMaterialService(RawMaterialRepository rawMaterialRepository,
                              SupplierRepository supplierRepository) {
        this.rawMaterialRepository = rawMaterialRepository;
        this.supplierRepository = supplierRepository;
    }

    @Transactional(readOnly = true)
    public List<RawMaterialResponse> getAllRawMaterials() {
        return rawMaterialRepository.findAll().stream()
                .map(EntityMapper::toRawMaterialResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public RawMaterialResponse getRawMaterialById(Long id) {
        RawMaterial rm = rawMaterialRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Raw material not found with id: " + id));
        return EntityMapper.toRawMaterialResponse(rm);
    }

    public RawMaterialResponse createRawMaterial(CreateRawMaterialRequest request) {
        if (rawMaterialRepository.findBySku(request.getSku()).isPresent()) {
            throw new BusinessException("Raw material SKU already exists: " + request.getSku());
        }

        Supplier supplier = null;
        if (request.getSupplierId() != null) {
            supplier = supplierRepository.findById(request.getSupplierId())
                    .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with id: " + request.getSupplierId()));
        }

        RawMaterial rm = new RawMaterial();
        rm.setSku(request.getSku());
        rm.setName(request.getName());
        rm.setDescription(request.getDescription());
        rm.setUnitCost(request.getUnitCost());
        rm.setStockQuantity(request.getStockQuantity() != null ? request.getStockQuantity() : BigDecimal.ZERO);
        rm.setReorderLevel(request.getReorderLevel() != null ? request.getReorderLevel() : BigDecimal.ZERO);
        rm.setUnitOfMeasure(request.getUnitOfMeasure());
        rm.setSupplier(supplier);

        RawMaterial saved = rawMaterialRepository.save(rm);
        return EntityMapper.toRawMaterialResponse(saved);
    }

    public RawMaterialResponse updateRawMaterial(Long id, CreateRawMaterialRequest request) {
        RawMaterial rm = rawMaterialRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Raw material not found with id: " + id));

        if (!rm.getSku().equals(request.getSku()) && rawMaterialRepository.findBySku(request.getSku()).isPresent()) {
            throw new BusinessException("Raw material SKU already exists: " + request.getSku());
        }

        Supplier supplier = null;
        if (request.getSupplierId() != null) {
            supplier = supplierRepository.findById(request.getSupplierId())
                    .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with id: " + request.getSupplierId()));
        }

        rm.setSku(request.getSku());
        rm.setName(request.getName());
        rm.setDescription(request.getDescription());
        rm.setUnitCost(request.getUnitCost());
        if (request.getStockQuantity() != null) {
            rm.setStockQuantity(request.getStockQuantity());
        }
        if (request.getReorderLevel() != null) {
            rm.setReorderLevel(request.getReorderLevel());
        }
        rm.setUnitOfMeasure(request.getUnitOfMeasure());
        rm.setSupplier(supplier);

        RawMaterial updated = rawMaterialRepository.save(rm);
        return EntityMapper.toRawMaterialResponse(updated);
    }

    public void deleteRawMaterial(Long id) {
        if (!rawMaterialRepository.existsById(id)) {
            throw new ResourceNotFoundException("Raw material not found with id: " + id);
        }
        rawMaterialRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public List<RawMaterialResponse> getLowStockMaterials() {
        return rawMaterialRepository.findLowStockMaterials().stream()
                .map(EntityMapper::toRawMaterialResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<RawMaterialResponse> getRawMaterialsBySupplier(Long supplierId) {
        return rawMaterialRepository.findBySupplierId(supplierId).stream()
                .map(EntityMapper::toRawMaterialResponse)
                .collect(Collectors.toList());
    }
}
