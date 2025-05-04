package com.example.controllers;

import org.springframework.web.bind.annotation.*;

import com.example.models.Address;

import java.util.List;

@RestController
@RequestMapping("/api/addresses")
public class AddressController {

    @GetMapping
    public List<Address> getAllAddresses() {
        // Logic to retrieve all addresses
        return null;
    }

    @GetMapping("/{id}")
    public Address getAddressById(@PathVariable Long id) {
        // Logic to retrieve an address by ID
        return null;
    }

    @PostMapping
    public Address createAddress(@RequestBody Address address) {
        // Logic to create a new address
        return null;
    }

    @PutMapping("/{id}")
    public Address updateAddress(@PathVariable Long id, @RequestBody Address address) {
        // Logic to update an existing address
        return null;
    }

    @DeleteMapping("/{id}")
    public void deleteAddress(@PathVariable Long id) {
        // Logic to delete an address
    }
}