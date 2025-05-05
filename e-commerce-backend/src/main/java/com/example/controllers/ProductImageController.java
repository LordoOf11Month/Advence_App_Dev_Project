package com.example.controllers;

//import com.example.services.ProductImageService;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
//import java.util.List;

@RestController
@RequestMapping("/api/product-images")
public class ProductImageController {
//    @Autowired
//    private ProductImageService imageService;
//
//    @GetMapping
//    public ResponseEntity<List<ImageDto>> list(@PathVariable Long productId) {
//        return ResponseEntity.ok(imageService.findByProduct(productId));
//    }
//
//    @PostMapping
//    public ResponseEntity<ImageDto> upload(@PathVariable Long productId,
//                                           @Valid @RequestBody ImageUploadDto dto) {
//        return ResponseEntity.ok(imageService.upload(productId, dto));
//    }
//
//    @PutMapping("/{imageId}")
//    public ResponseEntity<ImageDto> updateMeta(@PathVariable Long productId,
//                                               @PathVariable Long imageId,
//                                               @Valid @RequestBody ImageUpdateDto dto) {
//        return ResponseEntity.ok(imageService.update(productId, imageId, dto));
//    }
//
//    @DeleteMapping("/{imageId}")
//    public ResponseEntity<Void> delete(@PathVariable Long productId,
//                                       @PathVariable Long imageId) {
//        imageService.delete(productId, imageId);
//        return ResponseEntity.noContent().build();
//    }
}