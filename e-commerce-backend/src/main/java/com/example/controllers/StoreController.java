
package com.example.controllers;


import com.example.services.StoreService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.example.DTO.StoreDTO.*;
import java.util.List;

@RestController
@RequestMapping("/api/stores")
public class StoreController {
    @Autowired
    private StoreService storeService;

    @GetMapping
    public ResponseEntity<List<StoreResponse>> getAll() {
        return ResponseEntity.ok(storeService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<StoreResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(storeService.findById(id));
    }

    @GetMapping("/users/{userId}/stores")
    public ResponseEntity<List<StoreResponse>> getByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(storeService.findByOwner(userId));
    }

    @PostMapping
    public ResponseEntity<StoreResponse> create(@Valid @RequestBody StoreCreateRequest dto) {
        return ResponseEntity.ok(storeService.create(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<StoreResponse> update(@PathVariable Long id,
                                           @Valid @RequestBody StoreUpdateRequest dto) {
        return ResponseEntity.ok(storeService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        storeService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
