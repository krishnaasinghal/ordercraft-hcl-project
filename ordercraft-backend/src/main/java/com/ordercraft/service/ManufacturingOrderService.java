package com.ordercraft.service;

import com.ordercraft.dto.mapper.EntityMapper;
import com.ordercraft.dto.request.CreateOrderRequest;
import com.ordercraft.dto.request.CreatePurchaseOrderRequest;
import com.ordercraft.dto.response.OrderResponse;
import com.ordercraft.dto.response.PurchaseOrderResponse;
import com.ordercraft.entity.*;
import com.ordercraft.enums.BomStatus;
import com.ordercraft.enums.OrderStatus;
import com.ordercraft.enums.Priority;
import com.ordercraft.exception.BusinessException;
import com.ordercraft.exception.ResourceNotFoundException;
import com.ordercraft.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.Year;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class ManufacturingOrderService {

    private final ManufacturingOrderRepository orderRepository;
    private final CustomerRepository customerRepository;
    private final ProductRepository productRepository;
    private final BillOfMaterialRepository bomRepository;
    private final RawMaterialRepository rawMaterialRepository;
    private final PurchaseOrderService purchaseOrderService;

    public ManufacturingOrderService(ManufacturingOrderRepository orderRepository,
                                     CustomerRepository customerRepository,
                                     ProductRepository productRepository,
                                     BillOfMaterialRepository bomRepository,
                                     RawMaterialRepository rawMaterialRepository,
                                     PurchaseOrderService purchaseOrderService) {
        this.orderRepository = orderRepository;
        this.customerRepository = customerRepository;
        this.productRepository = productRepository;
        this.bomRepository = bomRepository;
        this.rawMaterialRepository = rawMaterialRepository;
        this.purchaseOrderService = purchaseOrderService;
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getAllOrders(OrderStatus status, Priority priority, String search) {
        List<ManufacturingOrder> orders = orderRepository.findAll();

        if (status != null) {
            orders = orders.stream().filter(o -> o.getStatus() == status).collect(Collectors.toList());
        }
        if (priority != null) {
            orders = orders.stream().filter(o -> o.getPriority() == priority).collect(Collectors.toList());
        }
        if (search != null && !search.isBlank()) {
            String q = search.toLowerCase();
            orders = orders.stream().filter(o ->
                    o.getOrderNumber().toLowerCase().contains(q) ||
                    (o.getCustomer() != null && o.getCustomer().getName().toLowerCase().contains(q))
            ).collect(Collectors.toList());
        }

        return orders.stream().map(EntityMapper::toOrderResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public OrderResponse getOrderById(Long id) {
        ManufacturingOrder order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Manufacturing order not found with id: " + id));
        return EntityMapper.toOrderResponse(order);
    }

    public OrderResponse createOrder(CreateOrderRequest request) {
        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + request.getCustomerId()));

        ManufacturingOrder order = new ManufacturingOrder();
        order.setOrderNumber(generateOrderNumber());
        order.setCustomer(customer);
        order.setStatus(OrderStatus.DRAFT);
        order.setPriority(request.getPriority() != null ? request.getPriority() : Priority.MEDIUM);
        order.setOrderDate(LocalDate.now());
        order.setDueDate(request.getDueDate() != null ? request.getDueDate() : LocalDate.now().plusDays(14));
        order.setNotes(request.getNotes());

        BigDecimal totalAmount = BigDecimal.ZERO;
        List<OrderItem> items = new ArrayList<>();

        for (CreateOrderRequest.OrderItemRequest itemReq : request.getItems()) {
            Product product = productRepository.findById(itemReq.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + itemReq.getProductId()));

            BigDecimal unitPrice = itemReq.getUnitPrice() != null ? itemReq.getUnitPrice() : product.getUnitPrice();
            BigDecimal lineTotal = unitPrice.multiply(BigDecimal.valueOf(itemReq.getQuantity())).setScale(2, RoundingMode.HALF_UP);
            totalAmount = totalAmount.add(lineTotal);

            OrderItem item = new OrderItem();
            item.setManufacturingOrder(order);
            item.setProduct(product);
            item.setQuantity(itemReq.getQuantity());
            item.setUnitPrice(unitPrice);
            item.setLineTotal(lineTotal);
            items.add(item);
        }

        order.setItems(items);
        order.setTotalAmount(totalAmount);

        ManufacturingOrder saved = orderRepository.save(order);
        return EntityMapper.toOrderResponse(saved);
    }

    public OrderResponse updateOrder(Long id, CreateOrderRequest request) {
        ManufacturingOrder order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Manufacturing order not found with id: " + id));

        if (order.getStatus() != OrderStatus.DRAFT) {
            throw new BusinessException("Cannot update an order that is already " + order.getStatus());
        }

        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + request.getCustomerId()));

        order.setCustomer(customer);
        order.setPriority(request.getPriority());
        order.setDueDate(request.getDueDate());
        order.setNotes(request.getNotes());

        order.getItems().clear();
        BigDecimal totalAmount = BigDecimal.ZERO;

        for (CreateOrderRequest.OrderItemRequest itemReq : request.getItems()) {
            Product product = productRepository.findById(itemReq.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + itemReq.getProductId()));

            BigDecimal unitPrice = itemReq.getUnitPrice() != null ? itemReq.getUnitPrice() : product.getUnitPrice();
            BigDecimal lineTotal = unitPrice.multiply(BigDecimal.valueOf(itemReq.getQuantity())).setScale(2, RoundingMode.HALF_UP);
            totalAmount = totalAmount.add(lineTotal);

            OrderItem item = new OrderItem();
            item.setManufacturingOrder(order);
            item.setProduct(product);
            item.setQuantity(itemReq.getQuantity());
            item.setUnitPrice(unitPrice);
            item.setLineTotal(lineTotal);
            order.getItems().add(item);
        }

        order.setTotalAmount(totalAmount);
        ManufacturingOrder updated = orderRepository.save(order);
        return EntityMapper.toOrderResponse(updated);
    }

    public OrderResponse updateOrderStatus(Long id, OrderStatus newStatus) {
        ManufacturingOrder order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Manufacturing order not found with id: " + id));

        if (newStatus == OrderStatus.COMPLETED) {
            order.setCompletionDate(LocalDate.now());
        }

        order.setStatus(newStatus);
        ManufacturingOrder updated = orderRepository.save(order);
        return EntityMapper.toOrderResponse(updated);
    }

    public void deleteOrder(Long id) {
        ManufacturingOrder order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Manufacturing order not found with id: " + id));

        if (order.getStatus() != OrderStatus.DRAFT && order.getStatus() != OrderStatus.CANCELLED) {
            throw new BusinessException("Only DRAFT or CANCELLED orders can be deleted");
        }
        orderRepository.delete(order);
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> explodeOrderBom(Long orderId) {
        ManufacturingOrder order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Manufacturing order not found with id: " + orderId));

        Map<Long, Map<String, Object>> aggregatedMaterials = new LinkedHashMap<>();

        for (OrderItem orderItem : order.getItems()) {
            Product product = orderItem.getProduct();
            BillOfMaterial bom = bomRepository.findByProductIdAndStatus(product.getId(), BomStatus.ACTIVE)
                    .orElse(null);

            if (bom == null) {
                List<BillOfMaterial> allBoms = bomRepository.findByProductId(product.getId());
                if (!allBoms.isEmpty()) {
                    bom = allBoms.get(0);
                }
            }

            if (bom != null) {
                BigDecimal orderQty = BigDecimal.valueOf(orderItem.getQuantity());

                for (BomItem bomItem : bom.getItems()) {
                    RawMaterial rm = bomItem.getRawMaterial();
                    BigDecimal baseQty = bomItem.getQuantityRequired().multiply(orderQty);
                    BigDecimal scrapPercent = bomItem.getScrapFactor() != null ? bomItem.getScrapFactor() : BigDecimal.ZERO;
                    BigDecimal scrapMultiplier = BigDecimal.ONE.add(scrapPercent.divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP));
                    BigDecimal totalItemRequired = baseQty.multiply(scrapMultiplier).setScale(2, RoundingMode.HALF_UP);

                    Map<String, Object> existing = aggregatedMaterials.get(rm.getId());
                    if (existing == null) {
                        Map<String, Object> entry = new LinkedHashMap<>();
                        entry.put("rawMaterialId", rm.getId());
                        entry.put("rawMaterialName", rm.getName());
                        entry.put("sku", rm.getSku());
                        entry.put("unitOfMeasure", bomItem.getUnitOfMeasure());
                        entry.put("unitCost", rm.getUnitCost());
                        entry.put("totalRequired", totalItemRequired);
                        entry.put("currentStock", rm.getStockQuantity() != null ? rm.getStockQuantity() : BigDecimal.ZERO);
                        if (rm.getSupplier() != null) {
                            entry.put("supplierId", rm.getSupplier().getId());
                            entry.put("supplierName", rm.getSupplier().getName());
                        }
                        aggregatedMaterials.put(rm.getId(), entry);
                    } else {
                        BigDecimal prevTotal = (BigDecimal) existing.get("totalRequired");
                        existing.put("totalRequired", prevTotal.add(totalItemRequired));
                    }
                }
            }
        }

        // Compute shortage and estimated procurement cost
        List<Map<String, Object>> result = new ArrayList<>();
        for (Map<String, Object> entry : aggregatedMaterials.values()) {
            BigDecimal req = (BigDecimal) entry.get("totalRequired");
            BigDecimal stock = (BigDecimal) entry.get("currentStock");
            BigDecimal shortage = req.subtract(stock).max(BigDecimal.ZERO);
            BigDecimal unitCost = (BigDecimal) entry.get("unitCost");
            entry.put("shortage", shortage);
            entry.put("procurementCost", shortage.multiply(unitCost).setScale(2, RoundingMode.HALF_UP));
            result.add(entry);
        }

        return result;
    }

    public List<PurchaseOrderResponse> generatePurchaseOrdersForOrder(Long orderId) {
        ManufacturingOrder order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Manufacturing order not found with id: " + orderId));

        List<Map<String, Object>> explodedMaterials = explodeOrderBom(orderId);

        // Group materials with shortage by supplier
        Map<Long, List<CreatePurchaseOrderRequest.PurchaseOrderItemRequest>> supplierItemsMap = new HashMap<>();

        for (Map<String, Object> mat : explodedMaterials) {
            BigDecimal shortage = (BigDecimal) mat.get("shortage");
            Long supplierId = (Long) mat.get("supplierId");

            if (supplierId != null && shortage.compareTo(BigDecimal.ZERO) > 0) {
                Long rawMaterialId = (Long) mat.get("rawMaterialId");
                BigDecimal unitCost = (BigDecimal) mat.get("unitCost");

                CreatePurchaseOrderRequest.PurchaseOrderItemRequest itemReq =
                        new CreatePurchaseOrderRequest.PurchaseOrderItemRequest(rawMaterialId, shortage, unitCost);

                supplierItemsMap.computeIfAbsent(supplierId, k -> new ArrayList<>()).add(itemReq);
            }
        }

        List<PurchaseOrderResponse> createdPos = new ArrayList<>();
        for (Map.Entry<Long, List<CreatePurchaseOrderRequest.PurchaseOrderItemRequest>> entry : supplierItemsMap.entrySet()) {
            CreatePurchaseOrderRequest poReq = new CreatePurchaseOrderRequest();
            poReq.setSupplierId(entry.getKey());
            poReq.setManufacturingOrderId(order.getId());
            poReq.setExpectedDeliveryDate(LocalDate.now().plusDays(7));
            poReq.setNotes("Auto-generated PO for Manufacturing Order #" + order.getOrderNumber());
            poReq.setItems(entry.getValue());

            PurchaseOrderResponse createdPo = purchaseOrderService.createPurchaseOrder(poReq);
            createdPos.add(createdPo);
        }

        return createdPos;
    }

    private String generateOrderNumber() {
        String yearPrefix = "MO-" + Year.now().getValue() + "-";
        try {
            int max = orderRepository.findMaxOrderNumberByPrefix(yearPrefix);
            return String.format("%s%05d", yearPrefix, max + 1);
        } catch (Exception e) {
            long count = orderRepository.count();
            return String.format("%s%05d", yearPrefix, count + 1);
        }
    }
}
