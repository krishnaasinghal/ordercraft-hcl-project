package com.ordercraft.service;

import com.ordercraft.dto.mapper.EntityMapper;
import com.ordercraft.dto.request.CreateCustomerRequest;
import com.ordercraft.dto.response.CustomerResponse;
import com.ordercraft.entity.Customer;
import com.ordercraft.exception.BusinessException;
import com.ordercraft.exception.ResourceNotFoundException;
import com.ordercraft.repository.CustomerRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class CustomerService {

    private final CustomerRepository customerRepository;

    public CustomerService(CustomerRepository customerRepository) {
        this.customerRepository = customerRepository;
    }

    @Transactional(readOnly = true)
    public List<CustomerResponse> getAllCustomers() {
        return customerRepository.findAll().stream()
                .map(EntityMapper::toCustomerResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CustomerResponse getCustomerById(Long id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + id));
        return EntityMapper.toCustomerResponse(customer);
    }

    public CustomerResponse createCustomer(CreateCustomerRequest request) {
        if (request.getEmail() != null && customerRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new BusinessException("Customer already exists with email: " + request.getEmail());
        }

        Customer customer = new Customer();
        customer.setName(request.getName());
        customer.setEmail(request.getEmail());
        customer.setPhone(request.getPhone());
        customer.setAddress(request.getAddress());
        customer.setCity(request.getCity());
        customer.setState(request.getState());
        customer.setZipCode(request.getZipCode());
        customer.setCountry(request.getCountry());
        customer.setGstNumber(request.getGstNumber());

        Customer saved = customerRepository.save(customer);
        return EntityMapper.toCustomerResponse(saved);
    }

    public CustomerResponse updateCustomer(Long id, CreateCustomerRequest request) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + id));

        customer.setName(request.getName());
        customer.setEmail(request.getEmail());
        customer.setPhone(request.getPhone());
        customer.setAddress(request.getAddress());
        customer.setCity(request.getCity());
        customer.setState(request.getState());
        customer.setZipCode(request.getZipCode());
        customer.setCountry(request.getCountry());
        customer.setGstNumber(request.getGstNumber());

        Customer updated = customerRepository.save(customer);
        return EntityMapper.toCustomerResponse(updated);
    }

    public void deleteCustomer(Long id) {
        if (!customerRepository.existsById(id)) {
            throw new ResourceNotFoundException("Customer not found with id: " + id);
        }
        customerRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public List<CustomerResponse> searchCustomers(String query) {
        return customerRepository.findByNameContainingIgnoreCase(query).stream()
                .map(EntityMapper::toCustomerResponse)
                .collect(Collectors.toList());
    }
}
