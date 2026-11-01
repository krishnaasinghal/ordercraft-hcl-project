package com.ordercraft.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DashboardResponse {
    private Map<String, Long> ordersByStatus;
    private Map<String, Long> purchaseOrdersByStatus;
    private Map<String, Long> invoicesByStatus;
    private BigDecimal totalRevenue;
    private BigDecimal pendingAmount;
    private long totalCustomers;
    private long totalProducts;
    private long totalSuppliers;
    private List<OrderResponse> recentOrders;
    private List<RawMaterialResponse> lowStockMaterials;
}
