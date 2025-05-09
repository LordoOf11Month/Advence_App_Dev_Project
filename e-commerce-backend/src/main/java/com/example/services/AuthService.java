package com.example.services;

import com.example.DTO.AuthDTO.JwtResponse;
import com.example.DTO.AuthDTO.LoginRequest;
import com.example.DTO.AuthDTO.RegisterRequest;
import com.example.models.User;
import com.example.repositories.UserRepository;
import com.example.security.JwtUtils;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.Customer;
import com.stripe.param.CustomerCreateParams;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.util.stream.Collectors;

@Service
public class AuthService {

    private final AuthenticationManager authManager;
    private final JwtUtils jwtUtils;
    private final UserRepository userRepo;
    private final PasswordEncoder encoder;

    @Value("${stripe.api.key}")
    private String stripeApiKey;



    public AuthService(AuthenticationManager authManager, JwtUtils jwtUtils, UserRepository userRepo, PasswordEncoder encoder) {
        this.authManager = authManager;
        this.jwtUtils = jwtUtils;
        this.userRepo = userRepo;
        this.encoder = encoder;
    }

    public JwtResponse authenticate(LoginRequest request) {
        Authentication auth = authManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );
        SecurityContextHolder.getContext().setAuthentication(auth);
        String jwt = jwtUtils.generateJwtToken(auth);

        // Cast the principal to your CustomUserDetails
        var userDetails = (com.example.security.CustomUserDetails) auth.getPrincipal();

        // Now you can access the underlying User entity and its properties
        com.example.models.User authenticatedUser = userDetails.getUser();

        var roles = auth.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList());

        JwtResponse response = new JwtResponse();
        response.setToken(jwt);
        response.setEmail(authenticatedUser.getEmail()); // Get email from your User entity
        response.setRoles(roles);
        response.setId((long) authenticatedUser.getId()); // Get the user ID from your User entity and set it in JwtResponse
        return response;
    }

    public void register(RegisterRequest req) {
        if (userRepo.findByEmail(req.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Email already taken");
        }
        User user = new User();
        // Set fields on user entity; map RegisterRequest fields properly
        user.setEmail(req.getEmail());
        
        // WARNING: For development only - DO NOT use in production
        // Store password as plaintext without hashing
        user.setPasswordHash(req.getPassword());
        
        user.setRole(User.Role.customer);
        user.setFirstName(req.getFirstName());
        user.setLastName(req.getLastName());
        user.setCreatedAt(new Timestamp(System.currentTimeMillis()));

        // Create a Stripe customer and get the ID
        try {
            Stripe.apiKey =this.stripeApiKey; // Set your Stripe API key
            CustomerCreateParams params = CustomerCreateParams.builder()
                    .setEmail(req.getEmail())
                    .setName(req.getFirstName() + " " + req.getLastName())
                    .build();

            Customer customer = Customer.create(params);
            user.setStripeCustomerId(customer.getId()); // Set the Stripe customer ID
        } catch (StripeException e) {
            // Handle Stripe API errors
            // You might want to log the error and potentially throw a custom exception
            throw new RuntimeException("Error creating Stripe customer: " + e.getMessage(), e);
        }

        // Save the user to the database
        userRepo.save(user);
    }
}
