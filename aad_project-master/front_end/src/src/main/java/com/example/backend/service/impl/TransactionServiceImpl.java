package com.example.backend.service.impl;

import com.example.backend.dto.TransactionDto;
import com.example.backend.repository.TransactionRepository;
import com.example.backend.service.TransactionService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TransactionServiceImpl implements TransactionService {

    private final TransactionRepository repo;
    private final ModelMapper mapper; // <- inject the mapper

    @Override
    public List<TransactionDto> search(LocalDateTime start,
                                       LocalDateTime end,
                                       String sellerEmail,
                                       String paymentStatus) {
        return repo.search(start, end, sellerEmail, paymentStatus);
    }

    @Override
    public List<TransactionDto> getAllTransactions() {
        return repo.findAll().stream()
                    .map(t -> mapper.map(t, TransactionDto.class))
                    .toList();
    }
}