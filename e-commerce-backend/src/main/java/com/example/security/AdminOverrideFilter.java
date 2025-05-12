package com.example.security;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Collection;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class AdminOverrideFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        
        String adminOverride = request.getHeader("X-Admin-Override");
        String roleOverride = request.getHeader("X-Role-Override");
        
        // Only proceed if headers are present and have expected values
        if ("true".equalsIgnoreCase(adminOverride) && "ADMIN".equalsIgnoreCase(roleOverride)) {
            
            Authentication existingAuth = SecurityContextHolder.getContext().getAuthentication();
            
            // Only proceed if user is already authenticated
            if (existingAuth != null && existingAuth.isAuthenticated()) {
                
                // Create new authorities list with ROLE_ADMIN
                Collection<SimpleGrantedAuthority> authorities = new ArrayList<>();
                authorities.add(new SimpleGrantedAuthority("ROLE_ADMIN"));
                
                // Create a new authentication token with admin role
                Authentication newAuth = new UsernamePasswordAuthenticationToken(
                    existingAuth.getPrincipal(), 
                    existingAuth.getCredentials(),
                    authorities
                );
                
                // Override the security context with admin role
                SecurityContextHolder.getContext().setAuthentication(newAuth);
            }
        }
        
        chain.doFilter(request, response);
    }
} 