package com.ordercraft.service;

import com.ordercraft.dto.mapper.EntityMapper;
import com.ordercraft.dto.response.DashboardResponse;
import com.ordercraft.dto.response.OrderResponse;
import com.ordercraft.dto.response.RawMaterialResponse;
import com.ordercraft.entity.Invoice;
import com.ordercraft.entity.ManufacturingOrder;
import com.ordercraft.enums.InvoiceStatus;
import com.ordercraft.enums.OrderStatus;
import com.ordercraft.enums.PurchaseOrderStatus;
import com.ordercraft.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class DashboardService {

    private final ManufacturingOrderRepository orderRepository;
    private final PurchaseOrderRepository purchaseOrderRepository;
    private final InvoiceRepository invoiceRepository;
    private final CustomerRepository customerRepository;
    private final ProductRepository productRepository;
    private final SupplierRepository supplierRepository;
    private final RawMaterialRepository rawMaterialRepository;

    public DashboardService(ManufacturingOrderRepository orderRepository,
                            PurchaseOrderRepository purchaseOrderRepository,
                            InvoiceRepository invoiceRepository,
                            CustomerRepository customerRepository,
                            ProductRepository productRepository,
                            SupplierRepository supplierRepository,
                            RawMaterialRepository rawMaterialRepository) {
        this.orderRepository = orderRepository;
        this.purchaseOrderRepository = purchaseOrderRepository;
        this.invoiceRepository = invoiceRepository;
        this.customerRepository = customerRepository;
        this.productRepository = productRepository;
        this.supplierRepository = supplierRepository;
        this.rawMaterialRepository = rawMaterialRepository;
    }

    public DashboardResponse getDashboardData() {
        DashboardResponse response = new DashboardResponse();

        // Orders by Status
        Map<String, Long> ordersByStatus = new LinkedHashMap<>();
        for (OrderStatus status : OrderStatus.values()) {
            ordersByStatus.put(status.name(), orderRepository.countByStatus(status));
        }
        response.setOrdersByStatus(ordersByStatus);

        // POs by Status
        Map<String, Long> posByStatus = new LinkedHashMap<>();
        for (PurchaseOrderStatus status : PurchaseOrderStatus.values()) {
            posByStatus.put(status.name(), purchaseOrderRepository.countByStatus(status));
        }
        response.setPurchaseOrdersByStatus(posByStatus);

        // Invoices by Status
        Map<String, Long> invByStatus = new LinkedHashMap<>();
        for (InvoiceStatus status : InvoiceStatus.values()) {
            invByStatus.put(status.name(), invoiceRepository.countByStatus(status));
        }
        response.setInvoicesByStatus(invByStatus);

        // Total Revenue & Pending Amount
        List<Invoice> allInvoices = invoiceRepository.findAll();
        BigDecimal totalRevenue = allInvoices.stream()
                .filter(inv -> inv.getStatus() == InvoiceStatus.PAID)
                .map(Invoice::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        response.setTotalRevenue(totalRevenue);

        BigDecimal pendingAmount = allInvoices.stream()
                .filter(inv -> inv.getStatus() == InvoiceStatus.SENT || inv.getStatus() == InvoiceStatus.PARTIALLY_PAID)
                .map(Invoice::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        response.setPendingAmount(pendingAmount);

        // Counts
        response.setTotalCustomers(customerRepository.count());
        response.setTotalProducts(productRepository.count());
        response.setTotalSuppliers(supplierRepository.count());

        // Recent Orders (last 5)
        List<OrderResponse> recentOrders = orderRepository.findAll().stream()
                .sorted(Comparator.comparing(ManufacturingOrder::getId).reversed())
                .limit(5)
                .map(EntityMapper::toOrderResponse)
                .collect(Collectors.toList());
        response.setRecentOrders(recentOrders);

        // Low stock materials
        List<RawMaterialResponse> lowStock = rawMaterialRepository.findLowStockMaterials().stream()
                .map(EntityMapper::toRawMaterialResponse)
                .collect(Collectors.toList());
        response.setLowStockMaterials(lowStock);

        return response;
    }

    public Map<String, Object> getExtendedStats() {
        DashboardResponse base = getDashboardData();
        Map<String, Object> stats = new LinkedHashMap<>();

        long totalOrders = orderRepository.count();
        stats.put("totalOrders", totalOrders);
        stats.put("ordersByStatus", base.getOrdersByStatus());

        // Revenue this month
        LocalDate startOfMonth = LocalDate.now().withDayOfMonth(1);
        BigDecimal revThisMonth = invoiceRepository.findAll().stream()
                .filter(inv -> inv.getStatus() == InvoiceStatus.PAID && inv.getIssueDate() != null && !inv.getIssueDate().isBefore(startOfMonth))
                .map(Invoice::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        stats.put("revenueThisMonth", revThisMonth.doubleValue());

        long pendingPos = purchaseOrderRepository.countByStatus(PurchaseOrderStatus.DRAFT) +
                          purchaseOrderRepository.countByStatus(PurchaseOrderStatus.SENT);
        stats.put("pendingPurchaseOrders", pendingPos);

        long overdueInvs = invoiceRepository.findAll().stream()
                .filter(inv -> (inv.getStatus() == InvoiceStatus.SENT || inv.getStatus() == InvoiceStatus.PARTIALLY_PAID)
                        && inv.getDueDate().isBefore(LocalDate.now()))
                .count();
        stats.put("overdueInvoices", overdueInvs);

        // Monthly revenue (last 6 months)
        List<Map<String, Object>> monthlyRev = new ArrayList<>();
        LocalDate now = LocalDate.now();
        for (int i = 5; i >= 0; i--) {
            LocalDate mDate = now.minusMonths(i);
            String monthName = mDate.getMonth().name().substring(0, 3) + " " + mDate.getYear();
            int monthVal = mDate.getMonthValue();
            int yearVal = mDate.getYear();

            BigDecimal mRev = invoiceRepository.findAll().stream()
                    .filter(inv -> inv.getIssueDate() != null
                            && inv.getIssueDate().getMonthValue() == monthVal
                            && inv.getIssueDate().getYear() == yearVal
                            && inv.getStatus() == InvoiceStatus.PAID)
                    .map(Invoice::getTotalAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            Map<String, Object> revItem = new HashMap<>();
            revItem.put("month", monthName);
            revItem.put("revenue", mRev.doubleValue());
            monthlyRev.add(revItem);
        }
        stats.put("monthlyRevenue", monthlyRev);

        stats.put("recentOrders", base.getRecentOrders());
        stats.put("lowStockMaterials", base.getLowStockMaterials());
        stats.put("totalCustomers", base.getTotalCustomers());
        stats.put("totalProducts", base.getTotalProducts());
        stats.put("totalSuppliers", base.getTotalSuppliers());
        stats.put("totalRevenue", base.getTotalRevenue());
        stats.put("pendingAmount", base.getPendingAmount());

        return stats;
    }
}
