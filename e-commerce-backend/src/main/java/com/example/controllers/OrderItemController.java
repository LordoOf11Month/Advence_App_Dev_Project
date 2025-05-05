package com.example.controllers;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/order-items")
public class OrderItemController {

    @PostMapping
    public String addOrderItem(@RequestBody String orderItem) {
        // Logic to add order item
        return "Order item added";
    }

    @PutMapping("/{id}")
    public String updateOrderItem(@PathVariable String id, @RequestBody String orderItem) {
        // Logic to update order item
        return "Order item updated";
    }

    @GetMapping("/{id}/reviews")
    public String getOrderItemReviews(@PathVariable String id) {
        // Logic to get reviews for an order item
        return "Order item reviews";
    }

    @PostMapping("/{id}/reviews")
    public String addReview(@PathVariable String id, @RequestBody String review) {
        // Logic to add a review for an order item
        return "Review added for order item";
    }
}