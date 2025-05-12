package com.example.backend.service.impl;

import com.example.backend.dto.ProductDTO;
import com.example.backend.entity.Category;
import com.example.backend.entity.Product;
import com.example.backend.entity.ProductImage;
import com.example.backend.entity.Store;
import com.example.backend.entity.User;
import com.example.backend.entity.Review;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.repository.CategoryRepository;
import com.example.backend.repository.ProductImageRepository;
import com.example.backend.repository.ProductRepository;
import com.example.backend.repository.StoreRepository;
import com.example.backend.repository.ReviewRepository;
import com.example.backend.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;


import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ProductServiceImpl implements ProductService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private StoreRepository storeRepository;

    @Autowired
    private ProductImageRepository productImageRepository;

    @Autowired
    private ReviewRepository reviewRepository;

    @Override
    public List<ProductDTO> findAll() {
        return productRepository.findAll().stream()
                .map(this::mapProductToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public ProductDTO findById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
        
        return mapProductToDTO(product);
    }

    @Override
    public List<ProductDTO> findByCategory(Long categoryId) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + categoryId));
        
        return productRepository.findByCategory(category).stream()
                .map(this::mapProductToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<ProductDTO> findByStore(Long storeId) {
        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new ResourceNotFoundException("Store not found with id: " + storeId));
        
        return productRepository.findByStore(store).stream()
                .map(this::mapProductToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<ProductDTO> search(String keyword) {
        return productRepository.search(keyword).stream()
                .map(this::mapProductToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ProductDTO create(ProductDTO productDTO) {
        Product product = new Product();
        
        // Set basic product information
        product.setName(productDTO.getName());
        product.setDescription(productDTO.getDescription());
        product.setPrice(productDTO.getPrice());
        product.setStockQuantity(productDTO.getStockQuantity());
        
        // Set store
        Store store = storeRepository.findById(productDTO.getStoreId())
                .orElseThrow(() -> new ResourceNotFoundException("Store not found with id: " + productDTO.getStoreId()));
        product.setStore(store);
        
        // Set category if provided
        if (productDTO.getCategoryId() != null) {
            Category category = categoryRepository.findById(productDTO.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + productDTO.getCategoryId()));
            product.setCategory(category);
        }
        
        // Save product first to get an ID
        Product savedProduct = productRepository.save(product);
        
        // Add images if provided
        if (productDTO.getImageUrls() != null && !productDTO.getImageUrls().isEmpty()) {
            List<ProductImage> images = new ArrayList<>();
            
            for (int i = 0; i < productDTO.getImageUrls().size(); i++) {
                ProductImage image = new ProductImage();
                image.setProduct(savedProduct);
                image.setImageUrl(productDTO.getImageUrls().get(i));
                image.setPrimaryImage(i == 0); // Make the first image primary
                images.add(productImageRepository.save(image));
            }
            
            savedProduct.setImages(images);
        }
        
        return mapProductToDTO(savedProduct);
    }

    @Override
    @Transactional
    public ProductDTO update(Long id, ProductDTO productDTO) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
        
        // Update basic product information
        if (productDTO.getName() != null) {
            product.setName(productDTO.getName());
        }
        
        if (productDTO.getDescription() != null) {
            product.setDescription(productDTO.getDescription());
        }
        
        if (productDTO.getPrice() != null) {
            product.setPrice(productDTO.getPrice());
        }
        
        if (productDTO.getStockQuantity() > 0) {
            product.setStockQuantity(productDTO.getStockQuantity());
        }
        
        // Update category if provided
        if (productDTO.getCategoryId() != null) {
            Category category = categoryRepository.findById(productDTO.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + productDTO.getCategoryId()));
            product.setCategory(category);
        }
        
        // Update images if provided
        if (productDTO.getImageUrls() != null && !productDTO.getImageUrls().isEmpty()) {
            // Remove existing images
            if (product.getImages() != null) {
                productImageRepository.deleteAll(product.getImages());
            }
            
            // Add new images
            List<ProductImage> images = new ArrayList<>();
            
            for (int i = 0; i < productDTO.getImageUrls().size(); i++) {
                ProductImage image = new ProductImage();
                image.setProduct(product);
                image.setImageUrl(productDTO.getImageUrls().get(i));
                image.setPrimaryImage(i == 0); // Make the first image primary
                images.add(productImageRepository.save(image));
            }
            
            product.setImages(images);
        }
        
        Product updatedProduct = productRepository.save(product);
        
        return mapProductToDTO(updatedProduct);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
        
        // Delete associated images first
        if (product.getImages() != null) {
            productImageRepository.deleteAll(product.getImages());
        }
        
        // Then delete the product
        productRepository.delete(product);
    }
    
    @Override
    public Map<String, Object> compareProducts(List<Long> productIds) {
        if (productIds.size() < 2) {
            throw new IllegalArgumentException("At least 2 products are required for comparison");
        }
        
        List<Product> products = productRepository.findAllById(productIds);
        
        if (products.size() != productIds.size()) {
            throw new ResourceNotFoundException("One or more products not found");
        }
        
        Map<String, Object> comparison = new HashMap<>();
        
        // Convert products to DTOs
        List<ProductDTO> productDTOs = products.stream()
                .map(this::mapProductToDTO)
                .collect(Collectors.toList());
        
        comparison.put("products", productDTOs);
        
        // Extract comparison features
        Map<String, List<Object>> features = new HashMap<>();
        
        // Price comparison
        List<Object> prices = products.stream()
                .map(Product::getPrice)
                .collect(Collectors.toList());
        features.put("price", prices);
        
        // Name comparison
        List<Object> names = products.stream()
                .map(Product::getName)
                .collect(Collectors.toList());
        features.put("name", names);
        
        // Description comparison
        List<Object> descriptions = products.stream()
                .map(Product::getDescription)
                .collect(Collectors.toList());
        features.put("description", descriptions);
        
        // Category comparison
        List<Object> categories = products.stream()
                .map(p -> p.getCategory() != null ? p.getCategory().getName() : null)
                .collect(Collectors.toList());
        features.put("category", categories);
        
        // Stock comparison
        List<Object> stocks = products.stream()
                .map(Product::getStockQuantity)
                .collect(Collectors.toList());
        features.put("stockQuantity", stocks);
        
        comparison.put("features", features);
        
        return comparison;
    }
    
    @Override
    public List<ProductDTO> findSellerProducts(Authentication authentication) {
        User seller = (User) authentication.getPrincipal();
        
        // Find stores owned by this seller
        List<Store> sellerStores = storeRepository.findBySeller(seller);
        
        if (sellerStores.isEmpty()) {
            return new ArrayList<>();
        }
        
        // Get products from all seller's stores
        List<Product> products = new ArrayList<>();
        for (Store store : sellerStores) {
            products.addAll(productRepository.findByStore(store));
        }
        
        return products.stream()
                .map(this::mapProductToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional
    public ProductDTO createSellerProduct(ProductDTO productDTO, Authentication authentication) {
        User seller = (User) authentication.getPrincipal();

        Store store = storeRepository.findById(productDTO.getStoreId())
                .orElseThrow(() -> new ResourceNotFoundException("Store not found with id: " + productDTO.getStoreId()));

        if (!store.getSeller().getId().equals(seller.getId())) {
            throw new AccessDeniedException("You can only add products to your own stores");
        }

        // Create new product with seller
        Product product = new Product();
        product.setName(productDTO.getName());
        product.setDescription(productDTO.getDescription());
        product.setPrice(productDTO.getPrice());
        product.setStockQuantity(productDTO.getStockQuantity());
        product.setStore(store);
        product.setSeller(seller);

        if (productDTO.getCategoryId() != null) {
            Category category = categoryRepository.findById(productDTO.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + productDTO.getCategoryId()));
            product.setCategory(category);
        }

        Product savedProduct = productRepository.save(product);

        // Save product images if provided
        if (productDTO.getImageUrls() != null) {
            List<ProductImage> images = new ArrayList<>();
            for (int i = 0; i < productDTO.getImageUrls().size(); i++) {
                ProductImage image = new ProductImage();
                image.setProduct(savedProduct);
                image.setImageUrl(productDTO.getImageUrls().get(i));
                image.setPrimaryImage(i == 0);
                images.add(productImageRepository.save(image));
            }
            savedProduct.setImages(images);
        }

        return mapProductToDTO(savedProduct);
    }
    
    @Override
    @Transactional
    public ProductDTO updateSellerProduct(Long id, ProductDTO productDTO, Authentication authentication) {
        User seller = (User) authentication.getPrincipal();
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));

        if (!product.getSeller().getId().equals(seller.getId())) {
            throw new AccessDeniedException("You can only update your own products");
        }

        // Update fields
        product.setName(productDTO.getName());
        product.setDescription(productDTO.getDescription());
        product.setPrice(productDTO.getPrice());
        product.setStockQuantity(productDTO.getStockQuantity());

        if (productDTO.getCategoryId() != null) {
            Category category = categoryRepository.findById(productDTO.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + productDTO.getCategoryId()));
            product.setCategory(category);
        }

        Product savedProduct = productRepository.save(product);

        // Update images if provided (similar logic)
        if (productDTO.getImageUrls() != null) {
            // Remove old images
            if (savedProduct.getImages() != null) {
                productImageRepository.deleteAll(savedProduct.getImages());
            }
            List<ProductImage> images = new ArrayList<>();
            for (int i = 0; i < productDTO.getImageUrls().size(); i++) {
                ProductImage image = new ProductImage();
                image.setProduct(savedProduct);
                image.setImageUrl(productDTO.getImageUrls().get(i));
                image.setPrimaryImage(i == 0);
                images.add(productImageRepository.save(image));
            }
            savedProduct.setImages(images);
        }

        return mapProductToDTO(savedProduct);
    }
    
    @Override
    @Transactional
    public void deleteSellerProduct(Long id, Authentication authentication) {
        User seller = (User) authentication.getPrincipal();
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));

        if (!product.getSeller().getId().equals(seller.getId())) {
            throw new AccessDeniedException("You can only delete your own products");
        }

        // Delete images and product
        if (product.getImages() != null) {
            productImageRepository.deleteAll(product.getImages());
        }
        productRepository.delete(product);
    }
    
    @Override
    public List<Map<String, Object>> getAllReviews() {
        return reviewRepository.findAll().stream()
                .map(review -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", review.getId());
                    map.put("productId", review.getProduct().getId());
                    map.put("productName", review.getProduct().getName());
                    map.put("userId", review.getUser().getId());
                    map.put("userName", review.getUser().getName() + " " + review.getUser().getSurname());
                    map.put("rating", review.getRating());
                    map.put("comment", review.getComment());
                    map.put("createdAt", review.getCreatedAt());
                    return map;
                })
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional
    public void deleteReview(Long id) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found with id: " + id));
        reviewRepository.delete(review);
    }
    
    @Override
    public List<ProductDTO> searchProducts(String keyword) {
        return search(keyword);
    }
    
    @Override
    public ProductDTO validateAndGetProductDTO(Long id) {
        return findById(id);
    }
    
    @Override
    public List<ProductDTO> findProductsByStore(Long storeId) {
        return findByStore(storeId);
    }
    
    private ProductDTO mapProductToDTO(Product product) {
        ProductDTO productDTO = new ProductDTO();
        // set existing fields
        productDTO.setId(product.getId());
        productDTO.setName(product.getName());
        productDTO.setDescription(product.getDescription());
        productDTO.setPrice(product.getPrice());
        productDTO.setStockQuantity(product.getStockQuantity());

        if (product.getStore() != null) {
            productDTO.setStoreId(product.getStore().getId());
            productDTO.setStoreName(product.getStore().getStoreName());
        }

        if (product.getCategory() != null) {
            productDTO.setCategoryId(product.getCategory().getId());
            productDTO.setCategoryName(product.getCategory().getName());
        }

        // Set seller info
        if (product.getSeller() != null) {
            productDTO.setSellerId(product.getSeller().getId());
            productDTO.setSellerName(product.getSeller().getName() + " " + product.getSeller().getSurname());
        }

        // Get image URLs
        List<String> imageUrls = new ArrayList<>();
        if (product.getImages() != null) {
            imageUrls = product.getImages().stream()
                    .map(ProductImage::getImageUrl)
                    .collect(Collectors.toList());
        }
        productDTO.setImageUrls(imageUrls);

        return productDTO;
    }
} 