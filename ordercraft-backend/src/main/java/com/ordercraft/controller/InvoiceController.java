package com.ordercraft.controller;

import com.ordercraft.dto.request.CreateInvoiceRequest;
import com.ordercraft.dto.response.InvoiceResponse;
import com.ordercraft.enums.InvoiceStatus;
import com.ordercraft.service.InvoiceService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/invoices")
public class InvoiceController {

    private final InvoiceService invoiceService;

    public InvoiceController(InvoiceService invoiceService) {
        this.invoiceService = invoiceService;
    }

    @GetMapping
    public ResponseEntity<List<InvoiceResponse>> getAllInvoices(
            @RequestParam(required = false) InvoiceStatus status,
            @RequestParam(required = false) Long customerId) {

        if (customerId != null) {
            return ResponseEntity.ok(invoiceService.getInvoicesByCustomerId(customerId));
        }
        return ResponseEntity.ok(invoiceService.getAllInvoices(status));
    }

    @GetMapping("/{id}")
    public ResponseEntity<InvoiceResponse> getInvoiceById(@PathVariable Long id) {
        return ResponseEntity.ok(invoiceService.getInvoiceById(id));
    }

    @GetMapping("/order/{orderId}")
    public ResponseEntity<InvoiceResponse> getInvoiceByOrderId(@PathVariable Long orderId) {
        return ResponseEntity.ok(invoiceService.getInvoiceByOrderId(orderId));
    }

    @GetMapping("/overdue")
    public ResponseEntity<List<InvoiceResponse>> getOverdueInvoices() {
        return ResponseEntity.ok(invoiceService.getOverdueInvoices());
    }

    @PostMapping
    public ResponseEntity<InvoiceResponse> createInvoice(@Valid @RequestBody CreateInvoiceRequest request) {
        InvoiceResponse response = invoiceService.generateInvoice(
                request.getManufacturingOrderId(),
                request.getTaxRate(),
                request.getNotes()
        );
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PostMapping("/generate/{orderId}")
    public ResponseEntity<InvoiceResponse> generateInvoiceForOrder(@PathVariable Long orderId) {
        InvoiceResponse response = invoiceService.generateInvoice(orderId, null, null);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<InvoiceResponse> updateStatus(@PathVariable Long id,
                                                        @RequestBody Map<String, String> statusBody) {
        String statusStr = statusBody.get("status");
        InvoiceStatus status = InvoiceStatus.valueOf(statusStr.toUpperCase());
        return ResponseEntity.ok(invoiceService.updateStatus(id, status));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteInvoice(@PathVariable Long id) {
        invoiceService.deleteInvoice(id);
        return ResponseEntity.noContent().build();
    }
}
