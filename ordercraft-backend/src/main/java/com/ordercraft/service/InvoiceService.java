package com.ordercraft.service;

import com.ordercraft.dto.mapper.EntityMapper;
import com.ordercraft.dto.response.InvoiceResponse;
import com.ordercraft.entity.Invoice;
import com.ordercraft.entity.ManufacturingOrder;
import com.ordercraft.enums.InvoiceStatus;
import com.ordercraft.enums.OrderStatus;
import com.ordercraft.exception.BusinessException;
import com.ordercraft.exception.ResourceNotFoundException;
import com.ordercraft.repository.InvoiceRepository;
import com.ordercraft.repository.ManufacturingOrderRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.Year;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class InvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final ManufacturingOrderRepository manufacturingOrderRepository;

    public InvoiceService(InvoiceRepository invoiceRepository,
                          ManufacturingOrderRepository manufacturingOrderRepository) {
        this.invoiceRepository = invoiceRepository;
        this.manufacturingOrderRepository = manufacturingOrderRepository;
    }

    @Transactional(readOnly = true)
    public List<InvoiceResponse> getAllInvoices(InvoiceStatus status) {
        List<Invoice> invoices = (status != null)
                ? invoiceRepository.findByStatus(status)
                : invoiceRepository.findAll();

        return invoices.stream().map(EntityMapper::toInvoiceResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public InvoiceResponse getInvoiceById(Long id) {
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found with id: " + id));
        return EntityMapper.toInvoiceResponse(invoice);
    }

    @Transactional(readOnly = true)
    public InvoiceResponse getInvoiceByOrderId(Long orderId) {
        Invoice invoice = invoiceRepository.findByManufacturingOrderId(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found for order id: " + orderId));
        return EntityMapper.toInvoiceResponse(invoice);
    }

    @Transactional(readOnly = true)
    public List<InvoiceResponse> getInvoicesByCustomerId(Long customerId) {
        return invoiceRepository.findByCustomerId(customerId).stream()
                .map(EntityMapper::toInvoiceResponse)
                .collect(Collectors.toList());
    }

    public InvoiceResponse generateInvoice(Long manufacturingOrderId, BigDecimal customTaxRate, String notes) {
        ManufacturingOrder order = manufacturingOrderRepository.findById(manufacturingOrderId)
                .orElseThrow(() -> new ResourceNotFoundException("Manufacturing order not found with id: " + manufacturingOrderId));

        if (invoiceRepository.findByManufacturingOrderId(manufacturingOrderId).isPresent()) {
            throw new BusinessException("Invoice already exists for order: " + order.getOrderNumber());
        }

        BigDecimal subtotal = order.getTotalAmount() != null ? order.getTotalAmount() : BigDecimal.ZERO;
        BigDecimal taxRate = (customTaxRate != null) ? customTaxRate : new BigDecimal("18.00");
        BigDecimal taxAmount = subtotal.multiply(taxRate).divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);
        BigDecimal totalAmount = subtotal.add(taxAmount);

        Invoice invoice = new Invoice();
        invoice.setInvoiceNumber(generateInvoiceNumber());
        invoice.setManufacturingOrder(order);
        invoice.setCustomer(order.getCustomer());
        invoice.setStatus(InvoiceStatus.DRAFT);
        invoice.setIssueDate(LocalDate.now());
        invoice.setDueDate(LocalDate.now().plusDays(30)); // Net 30 payment terms
        invoice.setSubtotal(subtotal);
        invoice.setTaxRate(taxRate);
        invoice.setTaxAmount(taxAmount);
        invoice.setTotalAmount(totalAmount);
        invoice.setNotes(notes != null ? notes : "Invoice generated for Order #" + order.getOrderNumber());

        Invoice saved = invoiceRepository.save(invoice);
        return EntityMapper.toInvoiceResponse(saved);
    }

    public InvoiceResponse updateStatus(Long id, InvoiceStatus status) {
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found with id: " + id));

        invoice.setStatus(status);
        Invoice updated = invoiceRepository.save(invoice);
        return EntityMapper.toInvoiceResponse(updated);
    }

    public void deleteInvoice(Long id) {
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found with id: " + id));

        if (invoice.getStatus() != InvoiceStatus.DRAFT && invoice.getStatus() != InvoiceStatus.CANCELLED) {
            throw new BusinessException("Only DRAFT or CANCELLED invoices can be deleted");
        }
        invoiceRepository.delete(invoice);
    }

    @Transactional(readOnly = true)
    public List<InvoiceResponse> getOverdueInvoices() {
        LocalDate today = LocalDate.now();
        return invoiceRepository.findAll().stream()
                .filter(inv -> (inv.getStatus() == InvoiceStatus.SENT || inv.getStatus() == InvoiceStatus.PARTIALLY_PAID)
                        && inv.getDueDate().isBefore(today))
                .map(EntityMapper::toInvoiceResponse)
                .collect(Collectors.toList());
    }

    private String generateInvoiceNumber() {
        String yearPrefix = "INV-" + Year.now().getValue() + "-";
        try {
            int max = invoiceRepository.findMaxInvoiceNumberByPrefix(yearPrefix);
            return String.format("%s%05d", yearPrefix, max + 1);
        } catch (Exception e) {
            long count = invoiceRepository.count();
            return String.format("%s%05d", yearPrefix, count + 1);
        }
    }
}
