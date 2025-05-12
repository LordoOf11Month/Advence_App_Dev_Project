package com.example.backend.service;

import com.example.backend.dto.ShipmentDTO;
import org.springframework.security.core.Authentication;

import java.util.List;

public interface ShipmentService {
    // Get all shipments for a seller
    List<ShipmentDTO> findSellerShipments(Authentication authentication);
    
    // Get a specific shipment
    ShipmentDTO findById(Long id);
    
    // Update shipment status with tracking number
    ShipmentDTO updateShipmentStatus(Long id, String status, String trackingNumber, Authentication authentication);
} 