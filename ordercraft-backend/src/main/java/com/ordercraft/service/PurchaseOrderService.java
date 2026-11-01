package com.ordercraft.service;

import com.ordercraft.dto.mapper.EntityMapper;
import com.ordercraft.dto.request.CreatePurchaseOrderRequest;
import com.ordercraft.dto.response.PurchaseOrderResponse;
import com.ordercraft.entity.ManufacturingOrder;
import com.ordercraft.entity.PurchaseOrder;
import com.ordercraft.entity.PurchaseOrderItem;
import com.ordercraft.entity.RawMaterial;
import com.ordercraft.entity.Supplier;
import com.ordercraft.enums.PurchaseOrderStatus;
import com.ordercraft.exception.BusinessException;
import com.ordercraft.exception.ResourceNotFoundException;
import com.ordercraft.repository.ManufacturingOrderRepository;
import com.ordercraft.repository.PurchaseOrderRepository;
import com.ordercraft.repository.RawMaterialRepository;
import com.ordercraft.repository.SupplierRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.Year;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class PurchaseOrderService {

    private final PurchaseOrderRepository purchaseOrderRepository;
    private final SupplierRepository supplierRepository;
    private final RawMaterialRepository rawMaterialRepository;
    private final ManufacturingOrderRepository manufacturingOrderRepository;

    public PurchaseOrderService(PurchaseOrderRepository purchaseOrderRepository,
                                SupplierRepository supplierRepository,
                                RawMaterialRepository rawMaterialRepository,
                                ManufacturingOrderRepository manufacturingOrderRepository) {
        this.purchaseOrderRepository = purchaseOrderRepository;
        this.supplierRepository = supplierRepository;
        this.rawMaterialRepository = rawMaterialRepository;
        this.manufacturingOrderRepository = manufacturingOrderRepository;
    }

    @Transactional(readOnly = true)
    public List<PurchaseOrderResponse> getAllPurchaseOrders(PurchaseOrderStatus status) {
        List<PurchaseOrder> list = (status != null)
                ? purchaseOrderRepository.findByStatus(status)
                : purchaseOrderRepository.findAll();

        return list.stream().map(EntityMapper::toPurchaseOrderResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PurchaseOrderResponse getPurchaseOrderById(Long id) {
        PurchaseOrder po = purchaseOrderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Purchase order not found with id: " + id));
        return EntityMapper.toPurchaseOrderResponse(po);
    }

    @Transactional(readOnly = true)
    public List<PurchaseOrderResponse> getPurchaseOrdersByOrderId(Long orderId) {
        return purchaseOrderRepository.findByManufacturingOrderId(orderId).stream()
                .map(EntityMapper::toPurchaseOrderResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<PurchaseOrderResponse> getPurchaseOrdersBySupplier(Long supplierId) {
        return purchaseOrderRepository.findBySupplierId(supplierId).stream()
                .map(EntityMapper::toPurchaseOrderResponse)
                .collect(Collectors.toList());
    }

    public PurchaseOrderResponse createPurchaseOrder(CreatePurchaseOrderRequest request) {
        Supplier supplier = supplierRepository.findById(request.getSupplierId())
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with id: " + request.getSupplierId()));

        ManufacturingOrder mo = null;
        if (request.getManufacturingOrderId() != null) {
            mo = manufacturingOrderRepository.findById(request.getManufacturingOrderId())
                    .orElseThrow(() -> new ResourceNotFoundException("Manufacturing order not found with id: " + request.getManufacturingOrderId()));
        }

        PurchaseOrder po = new PurchaseOrder();
        po.setPoNumber(generatePoNumber());
        po.setSupplier(supplier);
        po.setManufacturingOrder(mo);
        po.setStatus(PurchaseOrderStatus.DRAFT);
        po.setOrderDate(LocalDate.now());
        po.setExpectedDeliveryDate(request.getExpectedDeliveryDate() != null ? request.getExpectedDeliveryDate() : LocalDate.now().plusDays(7));
        po.setNotes(request.getNotes());

        BigDecimal total = BigDecimal.ZERO;
        List<PurchaseOrderItem> items = new ArrayList<>();
        for (CreatePurchaseOrderRequest.PurchaseOrderItemRequest itemReq : request.getItems()) {
            RawMaterial rm = rawMaterialRepository.findById(itemReq.getRawMaterialId())
                    .orElseThrow(() -> new ResourceNotFoundException("Raw material not found with id: " + itemReq.getRawMaterialId()));

            BigDecimal cost = itemReq.getUnitCost() != null ? itemReq.getUnitCost() : rm.getUnitCost();
            BigDecimal lineTotal = itemReq.getQuantity().multiply(cost).setScale(2, RoundingMode.HALF_UP);
            total = total.add(lineTotal);

            PurchaseOrderItem item = new PurchaseOrderItem();
            item.setPurchaseOrder(po);
            item.setRawMaterial(rm);
            item.setQuantity(itemReq.getQuantity());
            item.setUnitCost(cost);
            item.setLineTotal(lineTotal);
            items.add(item);
        }

        po.setItems(items);
        po.setTotalAmount(total);

        PurchaseOrder saved = purchaseOrderRepository.save(po);
        return EntityMapper.toPurchaseOrderResponse(saved);
    }

    public PurchaseOrderResponse updateStatus(Long id, PurchaseOrderStatus newStatus) {
        PurchaseOrder po = purchaseOrderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Purchase order not found with id: " + id));

        po.setStatus(newStatus);
        PurchaseOrder updated = purchaseOrderRepository.save(po);
        return EntityMapper.toPurchaseOrderResponse(updated);
    }

    public PurchaseOrderResponse receivePurchaseOrder(Long id) {
        PurchaseOrder po = purchaseOrderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Purchase order not found with id: " + id));

        if (po.getStatus() == PurchaseOrderStatus.RECEIVED) {
            throw new BusinessException("Purchase order is already received");
        }

        // Add received items to raw material stock inventory
        for (PurchaseOrderItem item : po.getItems()) {
            RawMaterial rm = item.getRawMaterial();
            BigDecimal currentStock = rm.getStockQuantity() != null ? rm.getStockQuantity() : BigDecimal.ZERO;
            rm.setStockQuantity(currentStock.add(item.getQuantity()));
            rawMaterialRepository.save(rm);
        }

        po.setStatus(PurchaseOrderStatus.RECEIVED);
        PurchaseOrder updated = purchaseOrderRepository.save(po);
        return EntityMapper.toPurchaseOrderResponse(updated);
    }

    public void deletePurchaseOrder(Long id) {
        PurchaseOrder po = purchaseOrderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Purchase order not found with id: " + id));

        if (po.getStatus() != PurchaseOrderStatus.DRAFT && po.getStatus() != PurchaseOrderStatus.CANCELLED) {
            throw new BusinessException("Only DRAFT or CANCELLED purchase orders can be deleted");
        }
        purchaseOrderRepository.delete(po);
    }

    private String generatePoNumber() {
        String yearPrefix = "PO-" + Year.now().getValue() + "-";
        try {
            int max = purchaseOrderRepository.findMaxPoNumberByPrefix(yearPrefix);
            return String.format("%s%05d", yearPrefix, max + 1);
        } catch (Exception e) {
            long count = purchaseOrderRepository.count();
            return String.format("%s%05d", yearPrefix, count + 1);
        }
    }
}
