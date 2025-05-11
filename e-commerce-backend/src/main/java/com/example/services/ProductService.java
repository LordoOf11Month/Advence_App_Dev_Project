package com.example.services;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.DTO.ProductDTO.CreateProductRequest;
import com.example.DTO.ProductDTO.ProductFilterRequest;
import com.example.DTO.ProductDTO.ProductResponse;
import com.example.models.Product;
import com.example.models.ProductImage;
import com.example.models.Store;
import com.example.models.User;
import com.example.repositories.ProductImageRepository;
import com.example.repositories.ProductRepository;
import com.example.repositories.StoreRepository;
import com.example.repositories.specifications.ProductSpecification;
import com.example.services.generic.GenericServiceImpl;

@Service
public class ProductService extends GenericServiceImpl<Product, ProductResponse, CreateProductRequest, Long> {

    private final ProductRepository productRepository;
    private final StoreRepository storeRepository;
    private final ProductImageRepository productImageRepository;

    public ProductService(ProductRepository productRepository, 
                         StoreRepository storeRepository,
                         ProductImageRepository productImageRepository) {
        super(productRepository);
        this.productRepository = productRepository;
        this.storeRepository = storeRepository;
        this.productImageRepository = productImageRepository;
    }

    // Fetch all products
    @Transactional(readOnly = true)
    public List<ProductResponse> listAllProducts() {
        return productRepository.findAllWithImages().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    // Browse and filter products
    @Transactional(readOnly = true)
    public Page<ProductResponse> browseProducts(ProductFilterRequest filter, Pageable pageable) {
        Specification<Product> spec = ProductSpecification.filterBy(filter);
        return findAll(spec, pageable);
    }

    // Get products by store ID
    @Transactional(readOnly = true)
    public List<ProductResponse> findByStore(Long storeId) {
        return productRepository.findByStoreIdWithImagesAndCategory(storeId).stream()
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
    public Optional<ProductResponse> findById(Long id) {
        return productRepository.findByIdWithImages(id)
                .map(this::convertToDto);
    }

    @Override
    @Transactional(readOnly = true)
    protected ProductResponse convertToDto(Product product) {
        ProductResponse response = new ProductResponse();
        response.setId(product.getId());
        response.setTitle(product.getName());
        response.setDescription(product.getDescription());
        response.setPrice(product.getPrice());
        response.setCategory(product.getCategory() != null ? product.getCategory().getName() : "Uncategorized");
        response.setInStock(product.getStockQuantity() > 0);
        response.setStockQuantity(product.getStockQuantity());
        response.setCreatedAt(product.getCreatedAt());
        response.setUpdatedAt(product.getUpdatedAt());
        response.setFreeShipping(product.isFreeShipping());
        response.setFastDelivery(product.isFastDelivery());
        
        // Add store and seller information
        if (product.getStore() != null) {
            Store store = product.getStore();
            response.setStoreId(store.getId());
            response.setStoreName(store.getStoreName());
            
            if (store.getSeller() != null) {
                User seller = store.getSeller();
                response.setSellerId(Long.valueOf(seller.getId()));
                response.setSellerName(seller.getFirstName() + " " + seller.getLastName());
            }
        }
        
        // Add image URLs to response
        if (product.getImages() != null) {
            List<String> imageUrls = product.getImages().stream()
                .map(ProductImage::getImageUrl)
                .collect(Collectors.toList());
            response.setImages(imageUrls);
        }
        
        return response;
    }

    @Override
    protected Product convertToEntity(CreateProductRequest request) {
        Product product = new Product();
        product.setName(request.getTitle());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setStockQuantity(request.getStockQuantity() != null ? request.getStockQuantity() : 0);
        
        // Handle image URLs
        if (request.getImageUrls() != null && !request.getImageUrls().isEmpty()) {
            List<ProductImage> productImages = request.getImageUrls().stream()
                .map(url -> {
                    ProductImage image = new ProductImage();
                    image.setImageUrl(url);
                    image.setProduct(product);
                    image.setIsPrimary(product.getImages() == null || product.getImages().isEmpty());
                    return image;
                })
                .collect(Collectors.toList());
            product.setImages(productImages);
        }
        
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
        
        // Handle image URLs update
        if (request.getImageUrls() != null) {
            // Clear existing images
            existingProduct.getImages().clear();
            
            // Add new images
            List<ProductImage> productImages = request.getImageUrls().stream()
                .map(url -> {
                    ProductImage image = new ProductImage();
                    image.setImageUrl(url);
                    image.setProduct(existingProduct);
                    image.setIsPrimary(existingProduct.getImages().isEmpty());
                    return image;
                })
                .collect(Collectors.toList());
            existingProduct.getImages().addAll(productImages);
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

    @Transactional
    public ProductResponse approveProduct(Long id, boolean approved) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));
        
        product.setApproved(approved);
        Product savedProduct = productRepository.save(product);
        return convertToDto(savedProduct);
    }

    @Transactional
    public ProductResponse toggleFreeShipping(Long id, boolean freeShipping) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));
        
        product.setFreeShipping(freeShipping);
        Product savedProduct = productRepository.save(product);
        return convertToDto(savedProduct);
    }

    @Transactional
    public ProductResponse toggleFastDelivery(Long id, boolean fastDelivery) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));
        
        product.setFastDelivery(fastDelivery);
        Product savedProduct = productRepository.save(product);
        return convertToDto(savedProduct);
    }

    @Transactional
    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));
        
        productRepository.delete(product);
    }

    @Transactional
    public ProductResponse updateProductImages(Long id, List<String> imageUrls) {
        System.out.println("Updating product images for product ID: " + id);
        System.out.println("Received image URLs: " + imageUrls);
        
        // Check for Discord CDN URLs
        boolean hasDiscordUrl = false;
        for (String url : imageUrls) {
            if (url != null && (url.contains("discordapp.net") || url.contains("discord.com"))) {
                hasDiscordUrl = true;
                System.out.println("Detected Discord CDN URL: " + url);
            }
        }
        
        Product existingProduct = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));
        
        // Filter out any null or empty URLs
        List<String> validImageUrls = imageUrls.stream()
                .filter(url -> url != null && !url.trim().isEmpty() && !url.equals("null") && !url.equals("undefined"))
                .collect(Collectors.toList());
        
        System.out.println("Valid image URLs after filtering: " + validImageUrls);
        
        // Check if there are any valid URLs
        if (validImageUrls.isEmpty()) {
            System.out.println("No valid image URLs provided, not updating images");
            // Don't clear existing images if no valid URLs are provided
            return convertToDto(existingProduct);
        }
        
        // Get existing images before clearing for logging
        List<String> oldImages = existingProduct.getImages().stream()
                .map(ProductImage::getImageUrl)
                .collect(Collectors.toList());
        System.out.println("Old images before clearing: " + oldImages);
        
        // IMPORTANT: We need to explicitly clear AND delete all existing images
        // to avoid stale data issues
        
        // Step 1: Clear existing images from memory
        existingProduct.getImages().clear();
        
        // Step 2: Explicitly delete all image records from the database
        productImageRepository.deleteAllByProductId(id);
        System.out.println("Deleted all product images from database for product ID: " + id);
        
        // Step 3: Flush changes to ensure deletion is committed
        Product updatedProduct = productRepository.saveAndFlush(existingProduct);
        System.out.println("Cleared all existing images and flushed changes");
        
        // Now add the new images
        List<ProductImage> newImages = new ArrayList<>();
        for (int i = 0; i < validImageUrls.size(); i++) {
            String url = validImageUrls.get(i);
            
            // Special handling for Discord CDN URLs
            if (url.contains("discordapp.net") || url.contains("discord.com")) {
                System.out.println("Adding Discord CDN URL without modification: " + url);
            }
            
            ProductImage image = new ProductImage();
            image.setImageUrl(url);
            image.setProduct(updatedProduct);
            image.setIsPrimary(i == 0); // First image is primary
            newImages.add(image);
        }
        
        // Step 4: Save all new images explicitly first
        newImages = productImageRepository.saveAll(newImages);
        System.out.println("Saved " + newImages.size() + " new product images");
        
        // Step 5: Add saved images to product and update
        updatedProduct.setImages(newImages);
        Product savedProduct = productRepository.save(updatedProduct);
        System.out.println("Saved product with " + savedProduct.getImages().size() + " new images");
        
        // Double-check what images are now in the DB
        List<String> newImageUrls = savedProduct.getImages().stream()
                .map(ProductImage::getImageUrl)
                .collect(Collectors.toList());
        System.out.println("New images after update: " + newImageUrls);
        
        // Step 6: Reload product from DB to ensure we have latest data
        Product reloadedProduct = productRepository.findByIdWithImages(id)
                .orElseThrow(() -> new RuntimeException("Product not found after saving"));
                
        return convertToDto(reloadedProduct);
    }

    // Modified method for handling admin product creation with Discord CDN URLs
    public ProductResponse saveWithDefaultStore(CreateProductRequest request, Long defaultStoreId) {
        Product product = convertToEntity(request);
        
        // Set a default store if none is specified
        if (product.getStore() == null) {
            Store defaultStore = storeRepository.findById(defaultStoreId)
                .orElseGet(() -> {
                    // Try to find any store if the specified one doesn't exist
                    return storeRepository.findAll().stream()
                        .findFirst()
                        .orElseThrow(() -> new RuntimeException("No stores available to assign to product"));
                });
                
            product.setStore(defaultStore);
            
            // Log for debugging
            System.out.println("Using default store for product: " + defaultStore.getStoreName() + " (ID: " + defaultStore.getId() + ")");
        }
        
        // For URLs with Discord CDN, ensure they're properly validated
        if (product.getImages() != null) {
            product.getImages().forEach(image -> {
                // Clean and sanitize the URL if needed
                String url = image.getImageUrl();
                if (url != null && url.contains("discordapp.net")) {
                    System.out.println("Processing Discord CDN URL: " + url);
                }
            });
        }
        
        Product savedProduct = repository.save(product);
        System.out.println("Product saved successfully with ID: " + savedProduct.getId());
        
        return convertToDto(savedProduct);
    }

    // Overriding the save method to ensure store is set
    @Override
    @Transactional
    public ProductResponse save(CreateProductRequest request) {
        // Use store ID 1 as default for admin-created products
        // This can be changed to any default store ID that exists in your system
        return saveWithDefaultStore(request, 1L);
    }
}