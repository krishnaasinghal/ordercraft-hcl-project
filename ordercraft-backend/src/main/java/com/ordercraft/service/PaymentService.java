package com.ordercraft.service;

import com.ordercraft.dto.mapper.EntityMapper;
import com.ordercraft.dto.request.CreatePaymentRequest;
import com.ordercraft.dto.response.PaymentResponse;
import com.ordercraft.entity.Invoice;
import com.ordercraft.entity.Payment;
import com.ordercraft.enums.InvoiceStatus;
import com.ordercraft.enums.PaymentStatus;
import com.ordercraft.exception.BusinessException;
import com.ordercraft.exception.ResourceNotFoundException;
import com.ordercraft.repository.InvoiceRepository;
import com.ordercraft.repository.PaymentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final InvoiceRepository invoiceRepository;

    public PaymentService(PaymentRepository paymentRepository,
                          InvoiceRepository invoiceRepository) {
        this.paymentRepository = paymentRepository;
        this.invoiceRepository = invoiceRepository;
    }

    @Transactional(readOnly = true)
    public List<PaymentResponse> getAllPayments() {
        return paymentRepository.findAll().stream()
                .map(EntityMapper::toPaymentResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PaymentResponse getPaymentById(Long id) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found with id: " + id));
        return EntityMapper.toPaymentResponse(payment);
    }

    @Transactional(readOnly = true)
    public List<PaymentResponse> getPaymentsByInvoiceId(Long invoiceId) {
        return paymentRepository.findByInvoiceId(invoiceId).stream()
                .map(EntityMapper::toPaymentResponse)
                .collect(Collectors.toList());
    }

    public PaymentResponse recordPayment(CreatePaymentRequest request) {
        Invoice invoice = invoiceRepository.findById(request.getInvoiceId())
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found with id: " + request.getInvoiceId()));

        if (invoice.getStatus() == InvoiceStatus.PAID) {
            throw new BusinessException("Invoice is already fully paid");
        }
        if (invoice.getStatus() == InvoiceStatus.CANCELLED) {
            throw new BusinessException("Cannot record payment for a cancelled invoice");
        }

        Payment payment = new Payment();
        payment.setInvoice(invoice);
        payment.setPaymentDate(request.getPaymentDate() != null ? request.getPaymentDate() : LocalDate.now());
        payment.setAmount(request.getAmount());
        payment.setPaymentMethod(request.getPaymentMethod());
        payment.setReferenceNumber(request.getReferenceNumber());
        payment.setStatus(PaymentStatus.COMPLETED);
        payment.setNotes(request.getNotes());

        Payment saved = paymentRepository.save(payment);

        // Update invoice payment status
        List<Payment> allPayments = paymentRepository.findByInvoiceId(invoice.getId());
        BigDecimal totalPaid = allPayments.stream()
                .filter(p -> p.getStatus() == PaymentStatus.COMPLETED)
                .map(Payment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        if (totalPaid.compareTo(invoice.getTotalAmount()) >= 0) {
            invoice.setStatus(InvoiceStatus.PAID);
        } else if (totalPaid.compareTo(BigDecimal.ZERO) > 0) {
            invoice.setStatus(InvoiceStatus.PARTIALLY_PAID);
        }
        invoiceRepository.save(invoice);

        return EntityMapper.toPaymentResponse(saved);
    }

    public void deletePayment(Long id) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found with id: " + id));

        Invoice invoice = payment.getInvoice();
        paymentRepository.delete(payment);

        // Recalculate invoice status
        List<Payment> remainingPayments = paymentRepository.findByInvoiceId(invoice.getId());
        BigDecimal totalPaid = remainingPayments.stream()
                .filter(p -> p.getStatus() == PaymentStatus.COMPLETED)
                .map(Payment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        if (totalPaid.compareTo(invoice.getTotalAmount()) >= 0) {
            invoice.setStatus(InvoiceStatus.PAID);
        } else if (totalPaid.compareTo(BigDecimal.ZERO) > 0) {
            invoice.setStatus(InvoiceStatus.PARTIALLY_PAID);
        } else {
            invoice.setStatus(InvoiceStatus.SENT);
        }
        invoiceRepository.save(invoice);
    }
}
