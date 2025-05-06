package com.example.services;

import java.sql.Timestamp;
import java.util.logging.Logger;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

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

@Service
public class AuthService {
    private static final Logger logger = Logger.getLogger(AuthService.class.getName());

    private final AuthenticationManager authManager;
    private final JwtUtils jwtUtils;
    private final UserRepository userRepo;
    private final PasswordEncoder encoder;

    @Value("${stripe.secret.key}")
    private String stripeApiKey;

    @Value("${stripe.test.mode:false}")
    private boolean stripeTestMode;

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
        
        logger.info("Registering new user with email: " + req.getEmail());
        
        User user = new User();
        // Set fields on user entity; map RegisterRequest fields properly
        user.setEmail(req.getEmail());
        user.setPasswordHash(encoder.encode(req.getPassword()));
        user.setRole(User.Role.customer);
        user.setFirstName(req.getFirstName());
        user.setLastName(req.getLastName());
        user.setCreatedAt(new Timestamp(System.currentTimeMillis()));

        // Skip Stripe integration if test mode is enabled
        if (stripeTestMode) {
            logger.info("Stripe test mode enabled. Using dummy customer ID.");
            user.setStripeCustomerId("test_" + System.currentTimeMillis());
        } 
        // Create a Stripe customer only if the API key is properly set and not in test mode
        else if (StringUtils.hasText(stripeApiKey) && !stripeApiKey.equals("YOUR_STRIPE_API_KEY")) {
            try {
                logger.info("Attempting to create Stripe customer with API key");
                Stripe.apiKey = this.stripeApiKey;
                CustomerCreateParams params = CustomerCreateParams.builder()
                        .setEmail(req.getEmail())
                        .setName(req.getFirstName() + " " + req.getLastName())
                        .build();

                Customer customer = Customer.create(params);
                user.setStripeCustomerId(customer.getId());
                logger.info("Created Stripe customer with ID: " + customer.getId());
            } catch (StripeException e) {
                logger.warning("Stripe error: " + e.getMessage());
                // Use a temporary ID for development
                user.setStripeCustomerId("dev_" + System.currentTimeMillis());
            }
        } else {
            logger.warning("Stripe API key not configured properly. Using temporary ID for development.");
            // Use a temporary ID for development
            user.setStripeCustomerId("dev_" + System.currentTimeMillis());
        }

        // Save the user to the database
        userRepo.save(user);
        logger.info("User successfully registered: " + req.getEmail());
    }
}
