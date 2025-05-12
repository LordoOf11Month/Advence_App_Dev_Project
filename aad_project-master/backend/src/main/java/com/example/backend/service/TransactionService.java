package com.example.backend.service;

import com.example.backend.dto.TransactionDto;

import java.time.LocalDateTime;
import java.util.List;

public interface TransactionService {
    List<TransactionDto> search(LocalDateTime start,
                                LocalDateTime end,
                                String sellerEmail,
                                String paymentStatus);

                                List<TransactionDto> getAllTransactions();
}
