package com.ordercraft.repository;

import com.ordercraft.entity.PurchaseOrder;
import com.ordercraft.enums.PurchaseOrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PurchaseOrderRepository extends JpaRepository<PurchaseOrder, Long> {

    Optional<PurchaseOrder> findByPoNumber(String poNumber);

    List<PurchaseOrder> findByManufacturingOrderId(Long manufacturingOrderId);

    List<PurchaseOrder> findBySupplierId(Long supplierId);

    List<PurchaseOrder> findByStatus(PurchaseOrderStatus status);

    long countByStatus(PurchaseOrderStatus status);

    @Query("SELECT COALESCE(MAX(CAST(SUBSTRING(po.poNumber, 9) AS int)), 0) FROM PurchaseOrder po WHERE po.poNumber LIKE :prefix%")
    int findMaxPoNumberByPrefix(@Param("prefix") String prefix);
}
