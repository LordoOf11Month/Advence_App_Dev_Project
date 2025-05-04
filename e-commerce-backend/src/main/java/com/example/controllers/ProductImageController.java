package com.example.controllers;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/product-images")
public class ProductImageController {

    @GetMapping
    public List<String> listProductImages() {
        // Logic to list product images
        return null;
    }

    @PostMapping
    public String uploadProductImage(@RequestBody String image) {
        // Logic to upload a product image
        return null;
    }

    @PutMapping("/{id}")
    public String updateProductImage(@PathVariable String id, @RequestBody String image) {
        // Logic to update a product image
        return null;
    }

    @DeleteMapping("/{id}")
    public String deleteProductImage(@PathVariable String id) {
        // Logic to delete a product image
        return null;
    }
}