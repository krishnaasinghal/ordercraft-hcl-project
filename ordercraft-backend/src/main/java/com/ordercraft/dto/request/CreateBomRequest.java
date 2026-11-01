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
public class CreateBomRequest {

    @NotNull(message = "Product ID is required")
    private Long productId;

    @NotBlank(message = "Version is required")
    @Size(max = 50, message = "Version must not exceed 50 characters")
    private String version;

    private LocalDate effectiveDate;

    private String notes;

    @NotNull(message = "BOM items are required")
    @Size(min = 1, message = "At least one BOM item is required")
    @Valid
    private List<BomItemRequest> items;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BomItemRequest {

        @NotNull(message = "Raw material ID is required")
        private Long rawMaterialId;

        @NotNull(message = "Quantity required is required")
        @Positive(message = "Quantity must be positive")
        private BigDecimal quantityRequired;

        @Size(max = 50, message = "Unit of measure must not exceed 50 characters")
        private String unitOfMeasure;

        @PositiveOrZero(message = "Scrap factor must be zero or positive")
        private BigDecimal scrapFactor;
    }
}
