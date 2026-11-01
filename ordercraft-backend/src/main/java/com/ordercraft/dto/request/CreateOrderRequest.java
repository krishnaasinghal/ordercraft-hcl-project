package com.ordercraft.dto.request;

import com.ordercraft.enums.Priority;
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
public class CreateOrderRequest {

    @NotNull(message = "Customer ID is required")
    private Long customerId;

    @NotNull(message = "Priority is required")
    private Priority priority;

    private LocalDate dueDate;

    private String notes;

    @NotNull(message = "Order items are required")
    @Size(min = 1, message = "At least one order item is required")
    @Valid
    private List<OrderItemRequest> items;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderItemRequest {

        @NotNull(message = "Product ID is required")
        private Long productId;

        @NotNull(message = "Quantity is required")
        @Positive(message = "Quantity must be positive")
        private Integer quantity;

        @Positive(message = "Unit price must be positive")
        private BigDecimal unitPrice;
    }
}
