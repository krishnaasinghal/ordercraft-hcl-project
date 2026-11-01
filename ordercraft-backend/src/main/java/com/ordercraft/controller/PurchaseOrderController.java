package com.ordercraft.controller;

import com.ordercraft.dto.request.CreatePurchaseOrderRequest;
import com.ordercraft.dto.response.PurchaseOrderResponse;
import com.ordercraft.enums.PurchaseOrderStatus;
import com.ordercraft.service.PurchaseOrderService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/purchase-orders")
public class PurchaseOrderController {

    private final PurchaseOrderService purchaseOrderService;

    public PurchaseOrderController(PurchaseOrderService purchaseOrderService) {
        this.purchaseOrderService = purchaseOrderService;
    }

    @GetMapping
    public ResponseEntity<List<PurchaseOrderResponse>> getAllPurchaseOrders(
            @RequestParam(required = false) PurchaseOrderStatus status,
            @RequestParam(required = false) Long supplierId,
            @RequestParam(required = false) Long orderId) {

        if (orderId != null) {
            return ResponseEntity.ok(purchaseOrderService.getPurchaseOrdersByOrderId(orderId));
        }
        if (supplierId != null) {
            return ResponseEntity.ok(purchaseOrderService.getPurchaseOrdersBySupplier(supplierId));
        }
        return ResponseEntity.ok(purchaseOrderService.getAllPurchaseOrders(status));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PurchaseOrderResponse> getPurchaseOrderById(@PathVariable Long id) {
        return ResponseEntity.ok(purchaseOrderService.getPurchaseOrderById(id));
    }

    @PostMapping
    public ResponseEntity<PurchaseOrderResponse> createPurchaseOrder(@Valid @RequestBody CreatePurchaseOrderRequest request) {
        PurchaseOrderResponse response = purchaseOrderService.createPurchaseOrder(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<PurchaseOrderResponse> updateStatus(@PathVariable Long id,
                                                              @RequestBody Map<String, String> statusBody) {
        String statusStr = statusBody.get("status");
        PurchaseOrderStatus status = PurchaseOrderStatus.valueOf(statusStr.toUpperCase());
        return ResponseEntity.ok(purchaseOrderService.updateStatus(id, status));
    }

    @PutMapping("/{id}/receive")
    public ResponseEntity<PurchaseOrderResponse> receivePurchaseOrder(@PathVariable Long id) {
        return ResponseEntity.ok(purchaseOrderService.receivePurchaseOrder(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePurchaseOrder(@PathVariable Long id) {
        purchaseOrderService.deletePurchaseOrder(id);
        return ResponseEntity.noContent().build();
    }
}
