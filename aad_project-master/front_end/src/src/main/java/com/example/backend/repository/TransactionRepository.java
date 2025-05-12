// backend/src/main/java/com/example/backend/repository/TransactionRepository.java
package com.example.backend.repository;

import com.example.backend.dto.TransactionDto;
import com.example.backend.entity.Transaction;
import com.example.backend.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    @Query("""
        SELECT new com.example.backend.dto.TransactionDto(
            o.id, p.id,
            buyer.email, seller.email,
            p.amount, p.status,
            o.shipmentStatus,           
            o.orderDate      
        )
        FROM Transaction t
        JOIN t.order   o
        JOIN t.payment p
        JOIN t.buyer   buyer
        JOIN t.seller  seller
        WHERE (:sellerEmail   IS NULL OR seller.email = :sellerEmail)
          AND (:paymentStatus IS NULL OR p.status      = :paymentStatus)
          AND (:start         IS NULL OR t.createdAt   >= :start)
          AND (:end           IS NULL OR t.createdAt   <= :end)
        ORDER BY t.createdAt DESC
    """)
    List<TransactionDto> search(
            @Param("start")        LocalDateTime start,
            @Param("end")          LocalDateTime end,
            @Param("sellerEmail")  String sellerEmail,
            @Param("paymentStatus") String paymentStatus
    );
    
    List<Transaction> findByPayment(Payment payment);
}
