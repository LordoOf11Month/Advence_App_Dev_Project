package com.example.controllers.generic;

import com.example.services.generic.GenericService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.io.Serializable;
import java.util.List;

public abstract class GenericController<T, D, C, ID extends Serializable> {
    
    protected final GenericService<T, D, C, ID> service;
    
    public GenericController(GenericService<T, D, C, ID> service) {
        this.service = service;
    }
    
    @GetMapping
    public ResponseEntity<Page<D>> getAll(Pageable pageable) {
        return ResponseEntity.ok(service.findAll(pageable));
    }
    
    @GetMapping("/all")
    public ResponseEntity<List<D>> getAll() {
        return ResponseEntity.ok(service.findAll());
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<D> getById(@PathVariable ID id) {
        return service.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping
    public ResponseEntity<D> create(@Valid @RequestBody C createDto) {
        return ResponseEntity.ok(service.save(createDto));
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<D> update(@PathVariable ID id, @Valid @RequestBody C updateDto) {
        return ResponseEntity.ok(service.update(id, updateDto));
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable ID id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
} 