package com.example.e_commerce_backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.CommandLineRunner;

@SpringBootApplication
public class ECommerceBackendApplication implements CommandLineRunner{

	public static void main(String[] args) {
        SpringApplication.run(ECommerceBackendApplication.class, args);
    }

    @Override
    public void run(String... args) throws Exception {
        System.out.println("✅ Spring Boot is connected to MySQL!");
    }
}
