package com.example.controllers;
import com.example.models.Product;
import com.example.service.ProductService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    @GetMapping
    public List<Product> listProducts() {
        // Logic to list products
        return null;
    }

    @GetMapping("/{id}")
    public Product getProduct(@PathVariable Long id) {
        // Logic to get product details
        return null;
    }

    @PostMapping
    public Product createProduct(@RequestBody Product product) {
        // Logic to create a new product
        return null;
    }

    @PutMapping("/{id}")
    public Product updateProduct(@PathVariable Long id, @RequestBody Product product) {
        // Logic to update an existing product
        return null;
    }

    @DeleteMapping("/{id}")
    public void deleteProduct(@PathVariable Long id) {
        // Logic to delete a product
    }
}