package com.ordercraft.controller;

import com.ordercraft.dto.request.CreateRawMaterialRequest;
import com.ordercraft.dto.response.RawMaterialResponse;
import com.ordercraft.service.RawMaterialService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/raw-materials")
public class RawMaterialController {

    private final RawMaterialService rawMaterialService;

    public RawMaterialController(RawMaterialService rawMaterialService) {
        this.rawMaterialService = rawMaterialService;
    }

    @GetMapping
    public ResponseEntity<List<RawMaterialResponse>> getAllRawMaterials(@RequestParam(required = false) Long supplierId) {
        if (supplierId != null) {
            return ResponseEntity.ok(rawMaterialService.getRawMaterialsBySupplier(supplierId));
        }
        return ResponseEntity.ok(rawMaterialService.getAllRawMaterials());
    }

    @GetMapping("/{id}")
    public ResponseEntity<RawMaterialResponse> getRawMaterialById(@PathVariable Long id) {
        return ResponseEntity.ok(rawMaterialService.getRawMaterialById(id));
    }

    @GetMapping("/low-stock")
    public ResponseEntity<List<RawMaterialResponse>> getLowStockMaterials() {
        return ResponseEntity.ok(rawMaterialService.getLowStockMaterials());
    }

    @PostMapping
    public ResponseEntity<RawMaterialResponse> createRawMaterial(@Valid @RequestBody CreateRawMaterialRequest request) {
        RawMaterialResponse response = rawMaterialService.createRawMaterial(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<RawMaterialResponse> updateRawMaterial(@PathVariable Long id,
                                                                 @Valid @RequestBody CreateRawMaterialRequest request) {
        return ResponseEntity.ok(rawMaterialService.updateRawMaterial(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRawMaterial(@PathVariable Long id) {
        rawMaterialService.deleteRawMaterial(id);
        return ResponseEntity.noContent().build();
    }
}
