package com.ordercraft.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreatePurchaseOrderRequest {

    @NotNull(message = "Supplier ID is required")
    private Long supplierId;

    private Long manufacturingOrderId;

    private LocalDate expectedDeliveryDate;

    private String notes;

    @NotNull(message = "Purchase order items are required")
    @Size(min = 1, message = "At least one item is required")
    @Valid
    private List<PurchaseOrderItemRequest> items;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PurchaseOrderItemRequest {

        @NotNull(message = "Raw material ID is required")
        private Long rawMaterialId;

        @NotNull(message = "Quantity is required")
        @Positive(message = "Quantity must be positive")
        private BigDecimal quantity;

        @Positive(message = "Unit cost must be positive")
        private BigDecimal unitCost;
    }
}
