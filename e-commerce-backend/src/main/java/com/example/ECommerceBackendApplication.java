package com.example;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.context.annotation.ComponentScan;

@SpringBootApplication
@EntityScan("com.example.models")
@ComponentScan(basePackages = {"com.example", "com.example.controllers", "com.example.services", "com.example.dto", "com.example.repositories"})
public class ECommerceBackendApplication {

	public static void main(String[] args) {
        SpringApplication.run(ECommerceBackendApplication.class, args);
    }

}
