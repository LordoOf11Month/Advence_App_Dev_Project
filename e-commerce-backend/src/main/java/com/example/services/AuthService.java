package com.example.services;

import com.example.DTO.AuthDTO.JwtResponse;
import com.example.DTO.AuthDTO.LoginRequest;
import com.example.DTO.AuthDTO.RegisterRequest;
import com.example.models.User;
import com.example.repositories.UserRepository;
import com.example.security.JwtUtils;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.stream.Collectors;

@Service
public class AuthService {

    private final AuthenticationManager authManager;
    private final JwtUtils jwtUtils;
    private final UserRepository userRepo;
    private final PasswordEncoder encoder;

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
        user.setPasswordHash(encoder.encode(req.getPassword()));
        user.setRole(User.Role.customer); // your enum values are lowercase
        // Optionally set other required fields like createdAt, etc.
        userRepo.save(user);
    }
}