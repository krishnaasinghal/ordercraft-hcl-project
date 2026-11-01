package com.ordercraft.dto.mapper;

import com.ordercraft.dto.response.*;
import com.ordercraft.entity.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

public final class EntityMapper {

    private EntityMapper() {
    }

    public static CustomerResponse toCustomerResponse(Customer customer) {
        CustomerResponse response = new CustomerResponse();
        response.setId(customer.getId());
        response.setName(customer.getName());
        response.setEmail(customer.getEmail());
        response.setPhone(customer.getPhone());
        response.setAddress(customer.getAddress());
        response.setCity(customer.getCity());
        response.setState(customer.getState());
        response.setZipCode(customer.getZipCode());
        response.setCountry(customer.getCountry());
        response.setGstNumber(customer.getGstNumber());
        response.setCreatedAt(customer.getCreatedAt());
        response.setUpdatedAt(customer.getUpdatedAt());
        return response;
    }

    public static SupplierResponse toSupplierResponse(Supplier supplier) {
        SupplierResponse response = new SupplierResponse();
        response.setId(supplier.getId());
        response.setName(supplier.getName());
        response.setContactPerson(supplier.getContactPerson());
        response.setEmail(supplier.getEmail());
        response.setPhone(supplier.getPhone());
        response.setAddress(supplier.getAddress());
        response.setCity(supplier.getCity());
        response.setState(supplier.getState());
        response.setZipCode(supplier.getZipCode());
        response.setCountry(supplier.getCountry());
        response.setGstNumber(supplier.getGstNumber());
        response.setCreatedAt(supplier.getCreatedAt());
        response.setUpdatedAt(supplier.getUpdatedAt());
        return response;
    }

    public static ProductResponse toProductResponse(Product product) {
        ProductResponse response = new ProductResponse();
        response.setId(product.getId());
        response.setSku(product.getSku());
        response.setName(product.getName());
        response.setDescription(product.getDescription());
        response.setUnitPrice(product.getUnitPrice());
        response.setCategory(product.getCategory());
        response.setUnitOfMeasure(product.getUnitOfMeasure());
        response.setCreatedAt(product.getCreatedAt());
        response.setUpdatedAt(product.getUpdatedAt());
        return response;
    }

    public static RawMaterialResponse toRawMaterialResponse(RawMaterial rm) {
        RawMaterialResponse response = new RawMaterialResponse();
        response.setId(rm.getId());
        response.setSku(rm.getSku());
        response.setName(rm.getName());
        response.setDescription(rm.getDescription());
        response.setUnitCost(rm.getUnitCost());
        response.setStockQuantity(rm.getStockQuantity());
        response.setReorderLevel(rm.getReorderLevel());
        response.setUnitOfMeasure(rm.getUnitOfMeasure());
        if (rm.getSupplier() != null) {
            response.setSupplierId(rm.getSupplier().getId());
            response.setSupplierName(rm.getSupplier().getName());
        }
        response.setCreatedAt(rm.getCreatedAt());
        response.setUpdatedAt(rm.getUpdatedAt());
        return response;
    }

    public static BomResponse toBomResponse(BillOfMaterial bom) {
        BomResponse response = new BomResponse();
        response.setId(bom.getId());
        response.setProductId(bom.getProduct().getId());
        response.setProductName(bom.getProduct().getName());
        response.setProductSku(bom.getProduct().getSku());
        response.setVersion(bom.getVersion());
        response.setStatus(bom.getStatus());
        response.setEffectiveDate(bom.getEffectiveDate());
        response.setNotes(bom.getNotes());
        response.setCreatedAt(bom.getCreatedAt());
        response.setUpdatedAt(bom.getUpdatedAt());

        if (bom.getItems() != null) {
            List<BomResponse.BomItemResponse> itemResponses = bom.getItems().stream()
                    .map(item -> {
                        BomResponse.BomItemResponse itemResponse = new BomResponse.BomItemResponse();
                        itemResponse.setId(item.getId());
                        itemResponse.setRawMaterialId(item.getRawMaterial().getId());
                        itemResponse.setRawMaterialName(item.getRawMaterial().getName());
                        itemResponse.setRawMaterialSku(item.getRawMaterial().getSku());
                        itemResponse.setQuantityRequired(item.getQuantityRequired());
                        itemResponse.setUnitOfMeasure(item.getUnitOfMeasure());
                        itemResponse.setScrapFactor(item.getScrapFactor());
                        return itemResponse;
                    })
                    .collect(Collectors.toList());
            response.setItems(itemResponses);
        }
        return response;
    }

    public static OrderResponse toOrderResponse(ManufacturingOrder order) {
        OrderResponse response = new OrderResponse();
        response.setId(order.getId());
        response.setOrderNumber(order.getOrderNumber());
        response.setCustomerId(order.getCustomer().getId());
        response.setCustomerName(order.getCustomer().getName());
        response.setStatus(order.getStatus());
        response.setPriority(order.getPriority());
        response.setOrderDate(order.getOrderDate());
        response.setDueDate(order.getDueDate());
        response.setCompletionDate(order.getCompletionDate());
        response.setTotalAmount(order.getTotalAmount());
        response.setNotes(order.getNotes());
        response.setCreatedAt(order.getCreatedAt());
        response.setUpdatedAt(order.getUpdatedAt());

        if (order.getItems() != null) {
            List<OrderResponse.OrderItemResponse> itemResponses = order.getItems().stream()
                    .map(item -> {
                        OrderResponse.OrderItemResponse itemResponse = new OrderResponse.OrderItemResponse();
                        itemResponse.setId(item.getId());
                        itemResponse.setProductId(item.getProduct().getId());
                        itemResponse.setProductName(item.getProduct().getName());
                        itemResponse.setProductSku(item.getProduct().getSku());
                        itemResponse.setQuantity(item.getQuantity());
                        itemResponse.setUnitPrice(item.getUnitPrice());
                        itemResponse.setLineTotal(item.getLineTotal());
                        return itemResponse;
                    })
                    .collect(Collectors.toList());
            response.setItems(itemResponses);
        }
        return response;
    }

    public static PurchaseOrderResponse toPurchaseOrderResponse(PurchaseOrder po) {
        PurchaseOrderResponse response = new PurchaseOrderResponse();
        response.setId(po.getId());
        response.setPoNumber(po.getPoNumber());
        response.setSupplierId(po.getSupplier().getId());
        response.setSupplierName(po.getSupplier().getName());
        if (po.getManufacturingOrder() != null) {
            response.setManufacturingOrderId(po.getManufacturingOrder().getId());
            response.setManufacturingOrderNumber(po.getManufacturingOrder().getOrderNumber());
        }
        response.setStatus(po.getStatus());
        response.setOrderDate(po.getOrderDate());
        response.setExpectedDeliveryDate(po.getExpectedDeliveryDate());
        response.setTotalAmount(po.getTotalAmount());
        response.setNotes(po.getNotes());
        response.setCreatedAt(po.getCreatedAt());
        response.setUpdatedAt(po.getUpdatedAt());

        if (po.getItems() != null) {
            List<PurchaseOrderResponse.PurchaseOrderItemResponse> itemResponses = po.getItems().stream()
                    .map(item -> {
                        PurchaseOrderResponse.PurchaseOrderItemResponse itemResponse = new PurchaseOrderResponse.PurchaseOrderItemResponse();
                        itemResponse.setId(item.getId());
                        itemResponse.setRawMaterialId(item.getRawMaterial().getId());
                        itemResponse.setRawMaterialName(item.getRawMaterial().getName());
                        itemResponse.setRawMaterialSku(item.getRawMaterial().getSku());
                        itemResponse.setQuantity(item.getQuantity());
                        itemResponse.setUnitCost(item.getUnitCost());
                        itemResponse.setLineTotal(item.getLineTotal());
                        return itemResponse;
                    })
                    .collect(Collectors.toList());
            response.setItems(itemResponses);
        }
        return response;
    }

    public static InvoiceResponse toInvoiceResponse(Invoice invoice) {
        InvoiceResponse response = new InvoiceResponse();
        response.setId(invoice.getId());
        response.setInvoiceNumber(invoice.getInvoiceNumber());
        response.setManufacturingOrderId(invoice.getManufacturingOrder().getId());
        response.setOrderNumber(invoice.getManufacturingOrder().getOrderNumber());
        response.setCustomerId(invoice.getCustomer().getId());
        response.setCustomerName(invoice.getCustomer().getName());
        response.setStatus(invoice.getStatus());
        response.setIssueDate(invoice.getIssueDate());
        response.setDueDate(invoice.getDueDate());
        response.setSubtotal(invoice.getSubtotal());
        response.setTaxRate(invoice.getTaxRate());
        response.setTaxAmount(invoice.getTaxAmount());
        response.setTotalAmount(invoice.getTotalAmount());
        response.setNotes(invoice.getNotes());
        response.setCreatedAt(invoice.getCreatedAt());
        response.setUpdatedAt(invoice.getUpdatedAt());

        BigDecimal paidAmount = BigDecimal.ZERO;
        if (invoice.getPayments() != null) {
            paidAmount = invoice.getPayments().stream()
                    .filter(p -> p.getStatus() == com.ordercraft.enums.PaymentStatus.COMPLETED)
                    .map(Payment::getAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
        }
        response.setPaidAmount(paidAmount);
        response.setBalanceAmount(invoice.getTotalAmount().subtract(paidAmount));
        return response;
    }

    public static PaymentResponse toPaymentResponse(Payment payment) {
        PaymentResponse response = new PaymentResponse();
        response.setId(payment.getId());
        response.setInvoiceId(payment.getInvoice().getId());
        response.setInvoiceNumber(payment.getInvoice().getInvoiceNumber());
        response.setPaymentDate(payment.getPaymentDate());
        response.setAmount(payment.getAmount());
        response.setPaymentMethod(payment.getPaymentMethod());
        response.setReferenceNumber(payment.getReferenceNumber());
        response.setStatus(payment.getStatus());
        response.setNotes(payment.getNotes());
        response.setCreatedAt(payment.getCreatedAt());
        response.setUpdatedAt(payment.getUpdatedAt());
        return response;
    }
}
