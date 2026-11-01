package com.ordercraft.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "bom_items")
public class BomItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bom_id", nullable = false)
    private BillOfMaterial billOfMaterial;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "raw_material_id", nullable = false)
    private RawMaterial rawMaterial;

    @Column(name = "quantity_required", nullable = false, precision = 15, scale = 4)
    private BigDecimal quantityRequired;

    @Column(name = "unit_of_measure")
    private String unitOfMeasure;

    @Column(name = "scrap_factor", precision = 5, scale = 2)
    private BigDecimal scrapFactor = BigDecimal.ZERO;
}
