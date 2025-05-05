package com.example.services;

import com.example.DTO.ProductDTO;
import com.example.DTO.ProductDTO.*;
import com.example.models.Product;
import com.example.repositories.ProductRepository;
import com.example.repositories.specifications.ProductSpecification;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;

@Service
public class ProductService {

    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    // Fetch all products
    public List<ProductResponse> listAllProducts() {
        return productRepository.findAll().stream()
                .map(this::toProductResponse)
                .collect(Collectors.toList());
    }

    // Browse and filter products
    public Page<Product> browseProducts(ProductDTO.ProductFilterRequest filter, Pageable pageable) {
        Specification<Product> spec = ProductSpecification.filterBy(filter);
        return productRepository.findAll(spec, pageable); // Supports pagination
    }

    // Fetch product by ID
    public ProductResponse findById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));
        return toProductResponse(product);
    }

    // Get products by store ID
    public List<ProductResponse> findByStore(Long storeId) {
        return productRepository.findByStore_Id(storeId).stream()
                .map(this::toProductResponse)
                .collect(Collectors.toList());
    }

    // Get products by category ID
    public List<ProductResponse> findByCategory(Long categoryId) {
        return productRepository.findByCategory_Id(categoryId).stream()
                .map(this::toProductResponse)
                .collect(Collectors.toList());
    }

    // Create a new product
    public ProductResponse create(CreateProductRequest request) {
        Product product = new Product();
        product.setName(request.getTitle());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setCategory(null); // Should be fetched and set based on category logic
        product.setStockQuantity(0); // Default or based on input
        productRepository.save(product);
        return toProductResponse(product);
    }

    // Update an existing product
    public ProductResponse update(Long id, CreateProductRequest request) {
        Product existingProduct = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));

        existingProduct.setName(request.getTitle());
        existingProduct.setDescription(request.getDescription());
        existingProduct.setPrice(request.getPrice());
        existingProduct.setCategory(null); // Fetch and update category logic
        productRepository.save(existingProduct);
        return toProductResponse(existingProduct);
    }

    // Delete product by ID
    public void delete(Long id) {
        productRepository.deleteById(id);
    }

    // Utility function to map Product to ProductResponse DTO
    private ProductResponse toProductResponse(Product product) {
        ProductResponse response = new ProductResponse();
        response.setId(product.getId());
        response.setTitle(product.getName());
        response.setDescription(product.getDescription());
        response.setPrice(product.getPrice());
        response.setCategory(product.getCategory() != null ? product.getCategory().getName() : "Uncategorized");
        response.setInStock(product.getStockQuantity() > 0);
        // Populate other fields as needed
        return response;
    }
}