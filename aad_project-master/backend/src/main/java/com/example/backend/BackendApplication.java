package com.example.backend;

import com.example.backend.entity.User;
import com.example.backend.entity.Role;
import com.example.backend.entity.Category;
import com.example.backend.entity.Product;
import com.example.backend.entity.Store;
import com.example.backend.repository.UserRepository;
import com.example.backend.repository.CategoryRepository;
import com.example.backend.repository.ProductRepository;
import com.example.backend.repository.StoreRepository;
import java.math.BigDecimal;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootApplication
public class BackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(BackendApplication.class, args);
    }

    @Bean
    public CommandLineRunner init(UserRepository userRepository, PasswordEncoder passwordEncoder,
                                  CategoryRepository categoryRepository,
                                  StoreRepository storeRepository,
                                  ProductRepository productRepository) {
        return args -> {
            // Create admin user if it doesn't exist
            if (!userRepository.existsByEmail("admin@example.com")) {
                User adminUser = new User(
                        "Admin",
                        "User",
                        "admin@example.com",
                        passwordEncoder.encode("admin123"),
                        Role.PLATFORM_ADMIN
                );
                userRepository.save(adminUser);
                System.out.println("Admin user created");
            }

            // Create a sample seller
            if (!userRepository.existsByEmail("seller@example.com")) {
                User sellerUser = new User(
                        "Sample",
                        "Seller",
                        "seller@example.com",
                        passwordEncoder.encode("seller123"),
                        Role.SELLER
                );
                userRepository.save(sellerUser);
                System.out.println("Sample seller created");
            }

            // Create a sample customer
            if (!userRepository.existsByEmail("customer@example.com")) {
                User customerUser = new User(
                        "Sample",
                        "Customer",
                        "customer@example.com",
                        passwordEncoder.encode("customer123"),
                        Role.CUSTOMER
                );
                userRepository.save(customerUser);
                System.out.println("Sample customer created");
            }

        };
    }
}