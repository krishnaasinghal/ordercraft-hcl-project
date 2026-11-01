package com.ordercraft.repository;

import com.ordercraft.entity.Invoice;
import com.ordercraft.enums.InvoiceStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, Long> {

    Optional<Invoice> findByInvoiceNumber(String invoiceNumber);

    Optional<Invoice> findByManufacturingOrderId(Long manufacturingOrderId);

    List<Invoice> findByCustomerId(Long customerId);

    List<Invoice> findByStatus(InvoiceStatus status);

    long countByStatus(InvoiceStatus status);

    @Query("SELECT COALESCE(MAX(CAST(SUBSTRING(i.invoiceNumber, 10) AS int)), 0) FROM Invoice i WHERE i.invoiceNumber LIKE :prefix%")
    int findMaxInvoiceNumberByPrefix(@Param("prefix") String prefix);
}
