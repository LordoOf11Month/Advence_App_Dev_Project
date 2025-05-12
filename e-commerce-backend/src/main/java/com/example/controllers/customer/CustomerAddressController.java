package com.example.controllers.customer;

import com.example.DTO.AddressDTO.AddressResponse;
import com.example.DTO.AddressDTO.CreateAddressRequest;
import com.example.DTO.AddressDTO.UpdateAddressRequest;
import com.example.services.AddressService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/addresses")
@PreAuthorize("isAuthenticated()")
public class CustomerAddressController {

    private final AddressService addressService;

    public CustomerAddressController(AddressService addressService) {
        this.addressService = addressService;
    }

    @GetMapping
    public ResponseEntity<List<AddressResponse>> getAllAddresses() {
        return ResponseEntity.ok(addressService.getCurrentUserAddresses());
    }

    @PostMapping
    public ResponseEntity<AddressResponse> createAddress(@Valid @RequestBody CreateAddressRequest request) {
        return new ResponseEntity<>(addressService.createAddress(request), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<AddressResponse> updateAddress(
            @PathVariable Integer id,
            @Valid @RequestBody UpdateAddressRequest request) {
        return ResponseEntity.ok(addressService.updateAddress(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAddress(@PathVariable Integer id) {
        addressService.deleteAddress(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/default")
    public ResponseEntity<AddressResponse> getDefaultAddress() {
        AddressResponse defaultAddress = addressService.getDefaultAddress();
        if (defaultAddress != null) {
            return ResponseEntity.ok(defaultAddress);
        } else {
            return ResponseEntity.notFound().build();
        }
    }
} 