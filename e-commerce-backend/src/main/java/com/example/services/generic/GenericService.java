package com.example.services.generic;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;

import java.io.Serializable;
import java.util.List;
import java.util.Optional;

public interface GenericService<T, D, C, ID extends Serializable> {
    List<D> findAll();
    Page<D> findAll(Pageable pageable);
    Page<D> findAll(Specification<T> spec, Pageable pageable);
    Optional<D> findById(ID id);
    D save(C createDto);
    D update(ID id, C updateDto);
    void delete(ID id);
    boolean exists(ID id);
    long count();
} 