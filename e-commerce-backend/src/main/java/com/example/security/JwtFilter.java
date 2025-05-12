package com.example.security;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.example.models.User;
import com.example.services.CustomUserDetailsService;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class JwtFilter extends OncePerRequestFilter {

    private static final List<String> PUBLIC_PATHS = Arrays.asList(
        "/api/auth/",
        "/api/public/",
        "/error",
        "/api/webhooks/",
        "/v3/api-docs",
        "/swagger-ui/",
        "/swagger-ui.html",
        "/favicon.ico",
        "/static/",
        "/assets/",
        "/images/"
    );

    private final JwtUtils jwtUtils;
    private final CustomUserDetailsService userDetailsService;
    private static final Logger logger = LoggerFactory.getLogger(JwtFilter.class);

    public JwtFilter(JwtUtils jwtUtils, CustomUserDetailsService userDetailsService) {
        this.jwtUtils = jwtUtils;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        try {
            String requestPath = request.getRequestURI();
            logger.info("Processing request: {} {}", request.getMethod(), requestPath);

            // Check if the request is for a public endpoint
            boolean isPublicPath = PUBLIC_PATHS.stream()
                .anyMatch(path -> {
                    if (path.endsWith("/")) {
                        return requestPath.startsWith(path) || requestPath.equals(path.substring(0, path.length() - 1));
                    } else {
                        return requestPath.equals(path) || requestPath.startsWith(path + "/");
                    }
                });
            
            if (isPublicPath) {
                logger.info("Public endpoint accessed: {}", requestPath);
                filterChain.doFilter(request, response);
                return;
            }

            String authHeader = request.getHeader("Authorization");
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                logger.warn("No Bearer token found in request");
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                return;
            }

            String token = authHeader.substring(7);
            if (!jwtUtils.validateJwtToken(token)) {
                logger.warn("Invalid token provided");
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                return;
            }

            String username = jwtUtils.getUserNameFromJwtToken(token);
            var userDetails = userDetailsService.loadUserByUsername(username);
            
            // Create authentication token
            UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                userDetails,
                null,
                userDetails.getAuthorities()
            );
            authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
            
            // Print authorities for debugging
            System.out.println("User " + userDetails.getUsername() + " has authorities: " + userDetails.getAuthorities());
            
            // Set user's authentication in SecurityContext
            SecurityContextHolder.getContext().setAuthentication(authToken);
            
            logger.info("Successfully authenticated user: {}", username);
            filterChain.doFilter(request, response);
        } catch (Exception e) {
            logger.error("Error processing JWT token: {}", e.getMessage(), e);
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        }
    }

    private Collection<SimpleGrantedAuthority> getAuthorities(User user) {
        // Map user role to proper Spring Security role format with ROLE_ prefix
        List<SimpleGrantedAuthority> authorities = new ArrayList<>();
        
        // For debugging - show what role the user has
        System.out.println("User email: " + user.getEmail() + ", Role: " + user.getRole());
        
        // Add the standard user role
        String roleString = "ROLE_" + user.getRole().toString().toUpperCase();
        authorities.add(new SimpleGrantedAuthority(roleString));
        
        // For customers, also add ROLE_USER for compatibility
        if (user.getRole() == User.Role.customer) {
            authorities.add(new SimpleGrantedAuthority("ROLE_USER"));
        }
        
        System.out.println("Granted authorities: " + authorities);
        return authorities;
    }
}