package com.ordercraft.service;

import com.ordercraft.dto.mapper.EntityMapper;
import com.ordercraft.dto.request.CreateProductRequest;
import com.ordercraft.dto.response.ProductResponse;
import com.ordercraft.entity.Product;
import com.ordercraft.exception.BusinessException;
import com.ordercraft.exception.ResourceNotFoundException;
import com.ordercraft.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class ProductService {

    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> getAllProducts() {
        return productRepository.findAll().stream()
                .map(EntityMapper::toProductResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ProductResponse getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
        return EntityMapper.toProductResponse(product);
    }

    public ProductResponse createProduct(CreateProductRequest request) {
        if (productRepository.findBySku(request.getSku()).isPresent()) {
            throw new BusinessException("Product SKU already exists: " + request.getSku());
        }

        Product product = new Product();
        product.setSku(request.getSku());
        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setUnitPrice(request.getUnitPrice());
        product.setCategory(request.getCategory());
        product.setUnitOfMeasure(request.getUnitOfMeasure());

        Product saved = productRepository.save(product);
        return EntityMapper.toProductResponse(saved);
    }

    public ProductResponse updateProduct(Long id, CreateProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));

        if (!product.getSku().equals(request.getSku()) && productRepository.findBySku(request.getSku()).isPresent()) {
            throw new BusinessException("Product SKU already exists: " + request.getSku());
        }

        product.setSku(request.getSku());
        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setUnitPrice(request.getUnitPrice());
        product.setCategory(request.getCategory());
        product.setUnitOfMeasure(request.getUnitOfMeasure());

        Product updated = productRepository.save(product);
        return EntityMapper.toProductResponse(updated);
    }

    public void deleteProduct(Long id) {
        if (!productRepository.existsById(id)) {
            throw new ResourceNotFoundException("Product not found with id: " + id);
        }
        productRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> searchProducts(String query) {
        return productRepository.findByNameContainingIgnoreCase(query).stream()
                .map(EntityMapper::toProductResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> getProductsByCategory(String category) {
        return productRepository.findByCategory(category).stream()
                .map(EntityMapper::toProductResponse)
                .collect(Collectors.toList());
    }
}
