package com.ordercraft.dto.response;

import com.ordercraft.enums.PaymentMethod;
import com.ordercraft.enums.PaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentResponse {
    private Long id;
    private Long invoiceId;
    private String invoiceNumber;
    private LocalDate paymentDate;
    private BigDecimal amount;
    private PaymentMethod paymentMethod;
    private String referenceNumber;
    private PaymentStatus status;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
