package com.ordercraft.service;

import com.ordercraft.dto.mapper.EntityMapper;
import com.ordercraft.dto.request.CreateSupplierRequest;
import com.ordercraft.dto.response.SupplierResponse;
import com.ordercraft.entity.Supplier;
import com.ordercraft.exception.ResourceNotFoundException;
import com.ordercraft.repository.SupplierRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class SupplierService {

    private final SupplierRepository supplierRepository;

    public SupplierService(SupplierRepository supplierRepository) {
        this.supplierRepository = supplierRepository;
    }

    @Transactional(readOnly = true)
    public List<SupplierResponse> getAllSuppliers() {
        return supplierRepository.findAll().stream()
                .map(EntityMapper::toSupplierResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public SupplierResponse getSupplierById(Long id) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with id: " + id));
        return EntityMapper.toSupplierResponse(supplier);
    }

    public SupplierResponse createSupplier(CreateSupplierRequest request) {
        Supplier supplier = new Supplier();
        supplier.setName(request.getName());
        supplier.setContactPerson(request.getContactPerson());
        supplier.setEmail(request.getEmail());
        supplier.setPhone(request.getPhone());
        supplier.setAddress(request.getAddress());
        supplier.setCity(request.getCity());
        supplier.setState(request.getState());
        supplier.setZipCode(request.getZipCode());
        supplier.setCountry(request.getCountry());
        supplier.setGstNumber(request.getGstNumber());

        Supplier saved = supplierRepository.save(supplier);
        return EntityMapper.toSupplierResponse(saved);
    }

    public SupplierResponse updateSupplier(Long id, CreateSupplierRequest request) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with id: " + id));

        supplier.setName(request.getName());
        supplier.setContactPerson(request.getContactPerson());
        supplier.setEmail(request.getEmail());
        supplier.setPhone(request.getPhone());
        supplier.setAddress(request.getAddress());
        supplier.setCity(request.getCity());
        supplier.setState(request.getState());
        supplier.setZipCode(request.getZipCode());
        supplier.setCountry(request.getCountry());
        supplier.setGstNumber(request.getGstNumber());

        Supplier updated = supplierRepository.save(supplier);
        return EntityMapper.toSupplierResponse(updated);
    }

    public void deleteSupplier(Long id) {
        if (!supplierRepository.existsById(id)) {
            throw new ResourceNotFoundException("Supplier not found with id: " + id);
        }
        supplierRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public List<SupplierResponse> searchSuppliers(String query) {
        return supplierRepository.findByNameContainingIgnoreCase(query).stream()
                .map(EntityMapper::toSupplierResponse)
                .collect(Collectors.toList());
    }
}
