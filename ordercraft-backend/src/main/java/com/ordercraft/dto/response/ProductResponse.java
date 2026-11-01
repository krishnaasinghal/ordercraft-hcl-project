package com.ordercraft.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductResponse {
    private Long id;
    private String sku;
    private String name;
    private String description;
    private BigDecimal unitPrice;
    private String category;
    private String unitOfMeasure;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
