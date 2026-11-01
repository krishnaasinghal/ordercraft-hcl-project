package com.ordercraft.repository;

import com.ordercraft.entity.BillOfMaterial;
import com.ordercraft.enums.BomStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BillOfMaterialRepository extends JpaRepository<BillOfMaterial, Long> {

    List<BillOfMaterial> findByProductId(Long productId);

    Optional<BillOfMaterial> findByProductIdAndStatus(Long productId, BomStatus status);
}
