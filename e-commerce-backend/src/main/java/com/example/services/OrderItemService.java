// src/main/java/com/example/services/OrderItemService.java
package com.example.services;

import com.example.models.OrderItem;
import com.example.repositories.OrderItemRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderItemService {

    private final OrderItemRepository orderItemRepository;

    /**
     * Add a new order-item.
     */
    @Transactional
    public OrderItem addOrderItem(OrderItem item) {
        // validate item.getOrder() and item.getProduct() as needed
        return orderItemRepository.save(item);
    }

    /**
     * Update quantity/price of an existing order-item.
     */
    @Transactional
    public OrderItem updateOrderItem(Long id, OrderItem item) {
        OrderItem existing = orderItemRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("OrderItem not found: " + id));
        existing.setQuantity(item.getQuantity());
        existing.setPriceAtPurchase(item.getPriceAtPurchase());
        return orderItemRepository.save(existing);
    }

    /**
     * Fetch all textual reviews for a given order-item.
     * (Stubbed – replace with real Review persistence later.)
     */
    @Transactional(readOnly = true)
    public List<String> getOrderItemReviews(Long orderItemId) {
        // TODO: fetch from a Review repository instead
        return Collections.emptyList();
    }

    /**
     * Add a new textual review to a given order-item.
     * (Stubbed – replace with real Review persistence later.)
     */
    @Transactional
    public String addReview(Long orderItemId, String review) {
        // TODO: persist review against orderItemId
        return "Review added for order item " + orderItemId;
    }
}