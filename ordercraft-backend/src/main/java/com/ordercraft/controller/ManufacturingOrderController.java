package com.ordercraft.controller;

import com.ordercraft.dto.request.CreateOrderRequest;
import com.ordercraft.dto.response.InvoiceResponse;
import com.ordercraft.dto.response.OrderResponse;
import com.ordercraft.dto.response.PurchaseOrderResponse;
import com.ordercraft.enums.OrderStatus;
import com.ordercraft.enums.Priority;
import com.ordercraft.service.InvoiceService;
import com.ordercraft.service.ManufacturingOrderService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/orders")
public class ManufacturingOrderController {

    private final ManufacturingOrderService orderService;
    private final InvoiceService invoiceService;

    public ManufacturingOrderController(ManufacturingOrderService orderService,
                                        InvoiceService invoiceService) {
        this.orderService = orderService;
        this.invoiceService = invoiceService;
    }

    @GetMapping
    public ResponseEntity<List<OrderResponse>> getAllOrders(
            @RequestParam(required = false) OrderStatus status,
            @RequestParam(required = false) Priority priority,
            @RequestParam(required = false) String search) {
        return ResponseEntity.ok(orderService.getAllOrders(status, priority, search));
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrderResponse> getOrderById(@PathVariable Long id) {
        return ResponseEntity.ok(orderService.getOrderById(id));
    }

    @PostMapping
    public ResponseEntity<OrderResponse> createOrder(@Valid @RequestBody CreateOrderRequest request) {
        OrderResponse response = orderService.createOrder(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<OrderResponse> updateOrder(@PathVariable Long id,
                                                     @Valid @RequestBody CreateOrderRequest request) {
        return ResponseEntity.ok(orderService.updateOrder(id, request));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<OrderResponse> updateStatus(@PathVariable Long id,
                                                      @RequestBody Map<String, String> statusBody) {
        String statusStr = statusBody.get("status");
        OrderStatus status = OrderStatus.valueOf(statusStr.toUpperCase());
        return ResponseEntity.ok(orderService.updateOrderStatus(id, status));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteOrder(@PathVariable Long id) {
        orderService.deleteOrder(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/explode-bom")
    public ResponseEntity<List<Map<String, Object>>> explodeBom(@PathVariable Long id) {
        return ResponseEntity.ok(orderService.explodeOrderBom(id));
    }

    @PostMapping("/{id}/generate-pos")
    public ResponseEntity<List<PurchaseOrderResponse>> generatePurchaseOrders(@PathVariable Long id) {
        return ResponseEntity.ok(orderService.generatePurchaseOrdersForOrder(id));
    }

    @PostMapping("/{id}/generate-invoice")
    public ResponseEntity<InvoiceResponse> generateInvoice(@PathVariable Long id) {
        return ResponseEntity.ok(invoiceService.generateInvoice(id, null, null));
    }
}
