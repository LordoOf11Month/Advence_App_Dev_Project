package com.example.services;

import com.example.DTO.ProductDTO.*;
import com.example.models.Product;
import com.example.models.Store;
import com.example.repositories.ProductRepository;
import com.example.repositories.StoreRepository;
import com.example.repositories.generic.GenericRepository;
import com.example.repositories.specifications.ProductSpecification;
import com.example.services.generic.GenericServiceImpl;
import org.springframework.stereotype.Service;
import org.springframework.security.access.AccessDeniedException;

import java.util.List;
import java.util.stream.Collectors;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;

@Service
public class ProductService extends GenericServiceImpl<Product, ProductResponse, CreateProductRequest, Long> {

    private final ProductRepository productRepository;
    private final StoreRepository storeRepository;

    public ProductService(ProductRepository productRepository, StoreRepository storeRepository) {
        super(productRepository);
        this.productRepository = productRepository;
        this.storeRepository = storeRepository;
    }

    // Fetch all products
    public List<ProductResponse> listAllProducts() {
        return findAll();
    }

    // Browse and filter products
    public Page<ProductResponse> browseProducts(ProductFilterRequest filter, Pageable pageable) {
        Specification<Product> spec = ProductSpecification.filterBy(filter);
        return findAll(spec, pageable);
    }

    // Get products by store ID
    public List<ProductResponse> findByStore(Long storeId) {
        return productRepository.findByStore_Id(storeId).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    // Get products by category ID with pagination
    public Page<ProductResponse> findByCategory(Long categoryId, Pageable pageable) {
        return productRepository.findByCategory_Id(categoryId, pageable)
                .map(this::convertToDto);
    }
    
    // Search products by name or description
    public Page<ProductResponse> search(String query, Pageable pageable) {
        if (query == null || query.trim().isEmpty()) {
            return findAll(pageable);
        }
        return productRepository.findByNameContainingOrDescriptionContaining(query, query, pageable)
                .map(this::convertToDto);
    }

    // Get products by store ID with pagination
    public Page<ProductResponse> findAllByStoreId(Long storeId, Pageable pageable) {
        return productRepository.findByStore_Id(storeId, pageable)
                .map(this::convertToDto);
    }

    // New method to find a product by ID and verify store ownership
    public Optional<ProductResponse> findByIdAndStoreId(Long productId, Long storeId) {
        Optional<Product> productOpt = productRepository.findById(productId);
        if (productOpt.isPresent()) {
            Product product = productOpt.get();
            if (product.getStore() != null && product.getStore().getId().equals(storeId)) {
                return Optional.of(convertToDto(product));
            }
        }
        return Optional.empty(); // Not found or does not belong to the store
    }

    @Override
    protected ProductResponse convertToDto(Product product) {
        ProductResponse response = new ProductResponse();
        response.setId(product.getId());
        response.setTitle(product.getName());
        response.setDescription(product.getDescription());
        response.setPrice(product.getPrice());
        response.setCategory(product.getCategory() != null ? product.getCategory().getName() : "Uncategorized");
        response.setInStock(product.getStockQuantity() > 0);
        response.setCreatedAt(product.getCreatedAt());
        response.setUpdatedAt(product.getUpdatedAt());
        return response;
    }

    @Override
    protected Product convertToEntity(CreateProductRequest request) {
        Product product = new Product();
        product.setName(request.getTitle());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setStockQuantity(request.getStockQuantity() != null ? request.getStockQuantity() : 0);
        return product;
    }

    private Product convertToEntityForSeller(CreateProductRequest request, Long storeId) {
        Product product = new Product();
        product.setName(request.getTitle());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setStockQuantity(request.getStockQuantity() != null ? request.getStockQuantity() : 0);
        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new RuntimeException("Store not found with id: " + storeId));
        product.setStore(store);
        return product;
    }

    public ProductResponse saveForSeller(CreateProductRequest request, Long storeId) {
        Product product = convertToEntityForSeller(request, storeId);
        Product savedProduct = repository.save(product);
        return convertToDto(savedProduct);
    }

    @Override
    protected Product convertToEntityForUpdate(Long id, CreateProductRequest request) {
        Product existingProduct = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));
        
        existingProduct.setName(request.getTitle());
        existingProduct.setDescription(request.getDescription());
        existingProduct.setPrice(request.getPrice());
        if (request.getStockQuantity() != null) {
            existingProduct.setStockQuantity(request.getStockQuantity());
        }
        return existingProduct;
    }

    public ProductResponse updateForSeller(Long productId, CreateProductRequest request, Long storeId) {
        Product existingProduct = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + productId));

        if (existingProduct.getStore() == null || !existingProduct.getStore().getId().equals(storeId)) {
            throw new AccessDeniedException("Seller does not have permission to update this product.");
        }

        existingProduct.setName(request.getTitle());
        existingProduct.setDescription(request.getDescription());
        existingProduct.setPrice(request.getPrice());
        if (request.getStockQuantity() != null) {
            existingProduct.setStockQuantity(request.getStockQuantity());
        }

        Product updatedProduct = productRepository.save(existingProduct);
        return convertToDto(updatedProduct);
    }

    public void deleteForSeller(Long productId, Long storeId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + productId));

        if (product.getStore() == null || !product.getStore().getId().equals(storeId)) {
            throw new AccessDeniedException("Seller does not have permission to delete this product.");
        }
        productRepository.deleteById(productId);
    }
}