package com.example.services;

import com.example.models.OrderEntity;
import com.example.repositories.OrderRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;


    public List<OrderEntity> listOrders() {
        return orderRepository.findAll();
    }


    public OrderEntity getOrderDetails(Long id) {
        return orderRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Order not found with id " + id));
    }


    public OrderEntity placeOrder(OrderEntity order) {
        // you can add business logic here (e.g. calculate totals, set timestamps, etc.)
        return orderRepository.save(order);
    }


    public OrderEntity updateOrderStatus(Long id, OrderEntity order) {
        OrderEntity existing = getOrderDetails(id);
        // assuming OrderEntity has a setStatus(...) method
        existing.setStatus(order.getStatus());
        return orderRepository.save(existing);
    }
}