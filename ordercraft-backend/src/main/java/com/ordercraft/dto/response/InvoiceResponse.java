package com.ordercraft.dto.response;

import com.ordercraft.enums.InvoiceStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InvoiceResponse {
    private Long id;
    private String invoiceNumber;
    private Long manufacturingOrderId;
    private String orderNumber;
    private Long customerId;
    private String customerName;
    private InvoiceStatus status;
    private LocalDate issueDate;
    private LocalDate dueDate;
    private BigDecimal subtotal;
    private BigDecimal taxRate;
    private BigDecimal taxAmount;
    private BigDecimal totalAmount;
    private BigDecimal paidAmount;
    private BigDecimal balanceAmount;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
