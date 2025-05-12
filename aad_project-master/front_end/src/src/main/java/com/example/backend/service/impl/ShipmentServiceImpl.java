package com.example.backend.service.impl;

import com.example.backend.dto.ShipmentDTO;
import com.example.backend.entity.Order;
import com.example.backend.entity.Role;
import com.example.backend.entity.Shipment;
import com.example.backend.entity.User;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.exception.BadRequestException;
import com.example.backend.repository.OrderRepository;
import com.example.backend.repository.ShipmentRepository;
import com.example.backend.service.ShipmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ShipmentServiceImpl implements ShipmentService {

    @Autowired
    private ShipmentRepository shipmentRepository;
    
    @Autowired
    private OrderRepository orderRepository;

    @Override
    public List<ShipmentDTO> findSellerShipments(Authentication authentication) {
        User seller = (User) authentication.getPrincipal();
        
        // Verify user is a seller
        if (seller.getRole() != Role.SELLER && seller.getRole() != Role.PLATFORM_ADMIN) {
            throw new AccessDeniedException("Only sellers can view their shipments");
        }
        
        List<Shipment> shipments = shipmentRepository.findBySeller(seller);
        
        return shipments.stream()
                .map(this::mapShipmentToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public ShipmentDTO findById(Long id) {
        Shipment shipment = shipmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Shipment not found with id: " + id));
        
        return mapShipmentToDTO(shipment);
    }

    @Override
    @Transactional
    public ShipmentDTO updateShipmentStatus(Long id, String status, String trackingNumber, Authentication authentication) {
        Shipment shipment = shipmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Shipment not found with id: " + id));
        
        User user = (User) authentication.getPrincipal();
        
        // Only the seller who created the shipment or an admin can update it
        if (user.getRole() != Role.PLATFORM_ADMIN && !shipment.getSeller().getId().equals(user.getId())) {
            throw new AccessDeniedException("You don't have permission to update this shipment");
        }
        
        // Validate the status
        List<String> validStatuses = List.of("PENDING", "SHIPPED", "DELIVERED", "CANCELLED");
        if (!validStatuses.contains(status)) {
            throw new BadRequestException("Invalid status: " + status);
        }
        
        // Update shipment status and timestamps
        shipment.setStatus(status);
        
        // Update tracking number if provided
        if (trackingNumber != null && !trackingNumber.isEmpty()) {
            shipment.setTrackingNumber(trackingNumber);
        }
        
        if (status.equals("SHIPPED") && shipment.getShippedAt() == null) {
            shipment.setShippedAt(LocalDateTime.now());
        } else if (status.equals("DELIVERED") && shipment.getDeliveredAt() == null) {
            shipment.setDeliveredAt(LocalDateTime.now());
        }
        
        Shipment updatedShipment = shipmentRepository.save(shipment);
        
        // Update the order status to match
        Order order = shipment.getOrder();
        if (status.equals("DELIVERED")) {
            order.setShipmentStatus("DELIVERED");
        } else if (status.equals("CANCELLED")) {
            order.setShipmentStatus("CANCELLED");
        }
        orderRepository.save(order);
        
        return mapShipmentToDTO(updatedShipment);
    }
    
    private String generateTrackingNumber() {
        // Generate a unique tracking number
        return "TRK-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }
    
    private ShipmentDTO mapShipmentToDTO(Shipment shipment) {
        ShipmentDTO dto = new ShipmentDTO();
        dto.setId(shipment.getId());
        dto.setOrderId(shipment.getOrder().getId());
        dto.setSellerId(shipment.getSeller().getId());
        dto.setStatus(shipment.getStatus());
        dto.setTrackingNumber(shipment.getTrackingNumber());
        dto.setCarrier(shipment.getCarrier());
        dto.setShippedAt(shipment.getShippedAt());
        dto.setDeliveredAt(shipment.getDeliveredAt());
        dto.setShippingAddress(shipment.getShippingAddress());
        dto.setRecipientName(shipment.getRecipientName());
        dto.setRecipientPhone(shipment.getRecipientPhone());
        
        return dto;
    }
} 