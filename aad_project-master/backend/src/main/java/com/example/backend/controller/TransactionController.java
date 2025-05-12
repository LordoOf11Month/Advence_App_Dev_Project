package com.example.backend.controller;

import com.example.backend.dto.TransactionDto;
import com.example.backend.service.TransactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService service;

    /* ---------- ADMIN: filtered search  ---------- */
    @PreAuthorize("hasRole('PLATFORM_ADMIN')")
    @GetMapping("/admin/transactions/search")          // <‑‑ path renamed
    public List<TransactionDto> adminTx(
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end,
            @RequestParam(required = false) String sellerEmail,
            @RequestParam(required = false) String paymentStatus) {
        return service.search(start, end, sellerEmail, paymentStatus);
    }

    /* ---------- SELLER: own transactions ---------- */
    @PreAuthorize("hasRole('SELLER')")
    @GetMapping("/seller/transactions")
    public List<TransactionDto> sellerTx(
            Authentication auth,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end,
            @RequestParam(required = false) String paymentStatus) {
        String sellerEmail = auth.getName();
        return service.search(start, end, sellerEmail, paymentStatus);
    }
}
