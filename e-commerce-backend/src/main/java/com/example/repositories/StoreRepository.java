package com.example.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.models.Store;
import com.example.repositories.generic.GenericRepository;

import java.util.List;

@Repository
public interface StoreRepository extends GenericRepository<Store, Long> {
    List<Store> findBySeller_Id(int sellerId);

}