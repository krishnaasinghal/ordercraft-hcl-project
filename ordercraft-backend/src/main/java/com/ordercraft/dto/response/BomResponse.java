package com.ordercraft.dto.response;

import com.ordercraft.enums.BomStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BomResponse {
    private Long id;
    private Long productId;
    private String productName;
    private String productSku;
    private String version;
    private BomStatus status;
    private LocalDate effectiveDate;
    private String notes;
    private List<BomItemResponse> items;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BomItemResponse {
        private Long id;
        private Long rawMaterialId;
        private String rawMaterialName;
        private String rawMaterialSku;
        private BigDecimal quantityRequired;
        private String unitOfMeasure;
        private BigDecimal scrapFactor;
    }
}
