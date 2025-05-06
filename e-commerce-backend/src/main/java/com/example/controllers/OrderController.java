package com.example.controllers;

import com.example.services.OrderService;
import lombok.NoArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.example.models.OrderEntity;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    @Autowired
    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @GetMapping
    public List<OrderEntity> listOrders() {
        return orderService.listOrders();
    }

    @GetMapping("/{id}")
    public OrderEntity getOrderDetails(@PathVariable Long id) {
        return orderService.getOrderDetails(id);
    }

    @PostMapping
    public OrderEntity placeOrder(@RequestBody OrderEntity order) {
        return orderService.placeOrder(order);
    }

    @PutMapping("/{id}")
    public OrderEntity updateOrderStatus(@PathVariable Long id, @RequestBody OrderEntity order) {
        return orderService.updateOrderStatus(id, order);
    }
}