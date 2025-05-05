package com.example.controllers;
import com.example.models.Product;
import com.example.services.ProductService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {
//    @Autowired
//    private ProductService productService;
//
//    @GetMapping
//    public ResponseEntity<List<ProductDto>> getAll() {
//        return ResponseEntity.ok(productService.listAllProducts());
//    }
//
//    @GetMapping("/{id}")
//    public ResponseEntity<ProductDto> getById(@PathVariable Long id) {
//        return ResponseEntity.ok(productService.findById(id));
//    }
//
//    @GetMapping("/stores/{storeId}/products")
//    public ResponseEntity<List<ProductDto>> getByStore(@PathVariable Long storeId) {
//        return ResponseEntity.ok(productService.findByStore(storeId));
//    }
//
//    @PostMapping
//    public ResponseEntity<ProductDto> create(@Valid @RequestBody ProductCreateDto dto) {
//        return ResponseEntity.ok(productService.create(dto));
//    }
//
//    @PutMapping("/{id}")
//    public ResponseEntity<ProductDto> update(@PathVariable Long id,
//                                             @Valid @RequestBody ProductUpdateDto dto) {
//        return ResponseEntity.ok(productService.update(id, dto));
//    }
//
//    @DeleteMapping("/{id}")
//    public ResponseEntity<Void> delete(@PathVariable Long id) {
//        productService.delete(id);
//        return ResponseEntity.noContent().build();
//    }
 }