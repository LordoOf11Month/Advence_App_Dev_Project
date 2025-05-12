package com.example.controllers;

import com.example.models.OrderItem;
import com.example.services.OrderItemService;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/api/order-items")
public class OrderItemController {

    private final OrderItemService orderItemService;

    public OrderItemController(OrderItemService orderItemService) {
        this.orderItemService = orderItemService;
    }

    @PostMapping
    public OrderItem addOrderItem(@RequestBody OrderItem orderItem) {
        return orderItemService.addOrderItem(orderItem);
    }

    @PutMapping("/{id}")
    public OrderItem updateOrderItem(
        @PathVariable Long id,
        @RequestBody OrderItem orderItem
    ) {
        return orderItemService.updateOrderItem(id, orderItem);
    }

    @GetMapping("/{id}/reviews")
    public List<String> getOrderItemReviews(@PathVariable Long id) {
        return orderItemService.getOrderItemReviews(id);
    }

    @PostMapping("/{id}/reviews")
    public String addReview(
        @PathVariable Long id,
        @RequestBody String review
    ) {
        return orderItemService.addReview(id, review);
    }
}