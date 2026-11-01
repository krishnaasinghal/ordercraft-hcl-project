package com.ordercraft.dto.request;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateRawMaterialRequest {

    @NotBlank(message = "SKU is required")
    @Size(max = 50, message = "SKU must not exceed 50 characters")
    private String sku;

    @NotBlank(message = "Material name is required")
    @Size(max = 255, message = "Name must not exceed 255 characters")
    private String name;

    private String description;

    @NotNull(message = "Unit cost is required")
    @Positive(message = "Unit cost must be positive")
    private BigDecimal unitCost;

    @NotNull(message = "Stock quantity is required")
    @PositiveOrZero(message = "Stock quantity must be zero or positive")
    private BigDecimal stockQuantity;

    @NotNull(message = "Reorder level is required")
    @PositiveOrZero(message = "Reorder level must be zero or positive")
    private BigDecimal reorderLevel;

    @Size(max = 50, message = "Unit of measure must not exceed 50 characters")
    private String unitOfMeasure;

    private Long supplierId;
}
