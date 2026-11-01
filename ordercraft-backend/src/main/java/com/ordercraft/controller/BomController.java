package com.ordercraft.controller;

import com.ordercraft.dto.request.CreateBomRequest;
import com.ordercraft.dto.response.BomResponse;
import com.ordercraft.enums.BomStatus;
import com.ordercraft.service.BomService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping({"/api/v1/boms", "/api/v1/bom"})
public class BomController {

    private final BomService bomService;

    public BomController(BomService bomService) {
        this.bomService = bomService;
    }

    @GetMapping
    public ResponseEntity<List<BomResponse>> getAllBoms(@RequestParam(required = false) BomStatus status) {
        return ResponseEntity.ok(bomService.getAllBoms(status));
    }

    @GetMapping("/{id}")
    public ResponseEntity<BomResponse> getBomById(@PathVariable Long id) {
        return ResponseEntity.ok(bomService.getBomById(id));
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<List<BomResponse>> getBomsByProduct(@PathVariable Long productId) {
        return ResponseEntity.ok(bomService.getBomsByProductId(productId));
    }

    @PostMapping
    public ResponseEntity<BomResponse> createBom(@Valid @RequestBody CreateBomRequest request) {
        BomResponse response = bomService.createBom(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<BomResponse> updateBom(@PathVariable Long id,
                                                 @Valid @RequestBody CreateBomRequest request) {
        return ResponseEntity.ok(bomService.updateBom(id, request));
    }

    @PutMapping("/{id}/activate")
    public ResponseEntity<BomResponse> activateBom(@PathVariable Long id) {
        return ResponseEntity.ok(bomService.activateBom(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBom(@PathVariable Long id) {
        bomService.deleteBom(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/explode")
    public ResponseEntity<List<Map<String, Object>>> explodeBom(@PathVariable Long id,
                                                                 @RequestParam(defaultValue = "1") BigDecimal quantity) {
        return ResponseEntity.ok(bomService.explodeBom(id, quantity));
    }
}
