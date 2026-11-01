package com.ordercraft.dto.response;

import com.ordercraft.enums.PurchaseOrderStatus;
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
public class PurchaseOrderResponse {
    private Long id;
    private String poNumber;
    private Long supplierId;
    private String supplierName;
    private Long manufacturingOrderId;
    private String manufacturingOrderNumber;
    private PurchaseOrderStatus status;
    private LocalDate orderDate;
    private LocalDate expectedDeliveryDate;
    private BigDecimal totalAmount;
    private String notes;
    private List<PurchaseOrderItemResponse> items;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PurchaseOrderItemResponse {
        private Long id;
        private Long rawMaterialId;
        private String rawMaterialName;
        private String rawMaterialSku;
        private BigDecimal quantity;
        private BigDecimal unitCost;
        private BigDecimal lineTotal;
    }
}
