package com.ordercraft.repository;

import com.ordercraft.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

    List<Payment> findByInvoiceId(Long invoiceId);

    List<Payment> findByPaymentDateBetween(LocalDate startDate, LocalDate endDate);
}
