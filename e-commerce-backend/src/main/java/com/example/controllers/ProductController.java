package com.example.controllers;
import com.example.models.Product;
import com.example.services.ProductService;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {
    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping
public List<Product> listProducts() {
    return productService.listAllProducts();
}

@GetMapping("/{id}")
public Product getProduct(@PathVariable Long id) {
    return productService.getProductById(id);
}

@PostMapping
public Product createProduct(@RequestBody Product product) {
    return productService.createProduct(product);
}

@PutMapping("/{id}")
public Product updateProduct(@PathVariable Long id, @RequestBody Product product) {
    return productService.updateProduct(id, product);
}

@DeleteMapping("/{id}")
public void deleteProduct(@PathVariable Long id) {
    productService.deleteProduct(id);
}
}