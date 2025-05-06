package com.example.security;

import java.io.IOException;
import java.util.logging.Logger;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import com.example.services.CustomUserDetailsService;

import io.jsonwebtoken.ExpiredJwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class JwtFilter extends OncePerRequestFilter {
    private static final Logger logger = Logger.getLogger(JwtFilter.class.getName());

    private final JwtUtils jwtUtils;
    private final CustomUserDetailsService userDetailsService;

    public JwtFilter(JwtUtils jwtUtils, CustomUserDetailsService userDetailsService) {
        this.jwtUtils = jwtUtils;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        
        String requestURI = request.getRequestURI();
        logger.info("Processing request: " + requestURI);
        
        // Skip token validation for auth endpoints
        if (requestURI.startsWith("/api/auth/")) {
            logger.info("Skipping JWT validation for auth endpoint: " + requestURI);
            chain.doFilter(request, response);
            return;
        }
        
        // Try to get token from cookie first
        String token = jwtUtils.getJwtFromCookies(request);
        logger.info("Token from cookie: " + (token != null ? "present" : "not present"));
        
        // If not in cookie, check Authorization header
        if (token == null) {
            token = getJwtFromAuthHeader(request);
            logger.info("Token from header: " + (token != null ? "present" : "not present"));
        }

        try {
            if (token != null && jwtUtils.validateJwtToken(token)) {
                String email = jwtUtils.getUserNameFromJwtToken(token);
                logger.info("Valid JWT token for user: " + email);
                
                var userDetails = userDetailsService.loadUserByUsername(email); // load by email as username
                var auth = new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(auth);
                
                logger.info("Authentication set in SecurityContext");
            } else {
                if (token == null) {
                    logger.warning("No JWT token found in request");
                } else {
                    logger.warning("Invalid JWT token");
                }
            }
        } catch (ExpiredJwtException e) {
            logger.warning("JWT token expired: " + e.getMessage());
        } catch (Exception e) {
            logger.severe("Could not authenticate: " + e.getMessage());
        }

        chain.doFilter(request, response);
    }
    
    private String getJwtFromAuthHeader(HttpServletRequest request) {
        String headerAuth = request.getHeader("Authorization");
        
        if (StringUtils.hasText(headerAuth) && headerAuth.startsWith("Bearer ")) {
            return headerAuth.substring(7);
        }
        
        return null;
    }
}