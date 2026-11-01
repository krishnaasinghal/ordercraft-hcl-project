package com.ordercraft.controller;

import com.ordercraft.dto.request.CreatePaymentRequest;
import com.ordercraft.dto.response.PaymentResponse;
import com.ordercraft.service.PaymentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/payments")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @GetMapping
    public ResponseEntity<List<PaymentResponse>> getAllPayments(@RequestParam(required = false) Long invoiceId) {
        if (invoiceId != null) {
            return ResponseEntity.ok(paymentService.getPaymentsByInvoiceId(invoiceId));
        }
        return ResponseEntity.ok(paymentService.getAllPayments());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PaymentResponse> getPaymentById(@PathVariable Long id) {
        return ResponseEntity.ok(paymentService.getPaymentById(id));
    }

    @GetMapping("/invoice/{invoiceId}")
    public ResponseEntity<List<PaymentResponse>> getPaymentsByInvoice(@PathVariable Long invoiceId) {
        return ResponseEntity.ok(paymentService.getPaymentsByInvoiceId(invoiceId));
    }

    @PostMapping
    public ResponseEntity<PaymentResponse> recordPayment(@Valid @RequestBody CreatePaymentRequest request) {
        PaymentResponse response = paymentService.recordPayment(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePayment(@PathVariable Long id) {
        paymentService.deletePayment(id);
        return ResponseEntity.noContent().build();
    }
}
