package com.ordercraft.repository;

import com.ordercraft.entity.ManufacturingOrder;
import com.ordercraft.enums.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface ManufacturingOrderRepository extends JpaRepository<ManufacturingOrder, Long> {

    Optional<ManufacturingOrder> findByOrderNumber(String orderNumber);

    List<ManufacturingOrder> findByStatus(OrderStatus status);

    List<ManufacturingOrder> findByCustomerId(Long customerId);

    List<ManufacturingOrder> findByOrderDateBetween(LocalDate startDate, LocalDate endDate);

    long countByStatus(OrderStatus status);

    @Query("SELECT mo FROM ManufacturingOrder mo WHERE mo.orderNumber LIKE %:query% OR mo.customer.name LIKE %:query%")
    Page<ManufacturingOrder> searchOrders(@Param("query") String query, Pageable pageable);

    @Query("SELECT COALESCE(MAX(CAST(SUBSTRING(mo.orderNumber, 9) AS int)), 0) FROM ManufacturingOrder mo WHERE mo.orderNumber LIKE :prefix%")
    int findMaxOrderNumberByPrefix(@Param("prefix") String prefix);
}
