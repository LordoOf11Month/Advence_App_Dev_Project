package com.example.controllers.admin;

import com.example.controllers.generic.GenericController;
import com.example.DTO.ProductDTO.ProductResponse;
import com.example.DTO.ProductDTO.CreateProductRequest;
import com.example.models.Product;
import com.example.services.ProductService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/products")
@PreAuthorize("hasRole('ADMIN')")
public class AdminProductController extends GenericController<Product, ProductResponse, CreateProductRequest, Long> {
    
    private final ProductService productService;
    
    public AdminProductController(ProductService productService) {
        super(productService);
        this.productService = productService;
    }
} 