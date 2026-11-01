package com.ordercraft.repository;

import com.ordercraft.entity.RawMaterial;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RawMaterialRepository extends JpaRepository<RawMaterial, Long> {

    Optional<RawMaterial> findBySku(String sku);

    @Query("SELECT rm FROM RawMaterial rm WHERE rm.stockQuantity <= rm.reorderLevel")
    List<RawMaterial> findLowStockMaterials();

    List<RawMaterial> findBySupplierId(Long supplierId);
}
