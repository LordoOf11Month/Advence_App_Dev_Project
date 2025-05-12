package com.example.services.generic;

import com.example.repositories.generic.GenericRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.transaction.annotation.Transactional;

import java.io.Serializable;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

public abstract class GenericServiceImpl<T, D, C, ID extends Serializable> implements GenericService<T, D, C, ID> {
    
    protected final GenericRepository<T, ID> repository;
    
    public GenericServiceImpl(GenericRepository<T, ID> repository) {
        this.repository = repository;
    }
    
    @Override
    public List<D> findAll() {
        return repository.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    @Override
    public Page<D> findAll(Pageable pageable) {
        return repository.findAll(pageable)
                .map(this::convertToDto);
    }
    
    @Override
    public Page<D> findAll(Specification<T> spec, Pageable pageable) {
        return repository.findAll(spec, pageable)
                .map(this::convertToDto);
    }
    
    @Override
    public Optional<D> findById(ID id) {
        return repository.findById(id)
                .map(this::convertToDto);
    }
    
    @Override
    @Transactional
    public D save(C createDto) {
        T entity = convertToEntity(createDto);
        T savedEntity = repository.save(entity);
        return convertToDto(savedEntity);
    }
    
    @Override
    @Transactional
    public D update(ID id, C updateDto) {
        if (!repository.existsById(id)) {
            throw new RuntimeException("Entity not found with id: " + id);
        }
        
        T entity = convertToEntityForUpdate(id, updateDto);
        T updatedEntity = repository.save(entity);
        return convertToDto(updatedEntity);
    }
    
    @Override
    @Transactional
    public void delete(ID id) {
        repository.deleteById(id);
    }
    
    @Override
    public boolean exists(ID id) {
        return repository.existsById(id);
    }
    
    @Override
    public long count() {
        return repository.count();
    }
    
    // Alt sınıfların uygulaması gereken abstract metodlar
    protected abstract D convertToDto(T entity);
    protected abstract T convertToEntity(C createDto);
    protected abstract T convertToEntityForUpdate(ID id, C updateDto);
} 