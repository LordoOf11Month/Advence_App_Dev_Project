package com.example.security;

import java.util.Collection;
import java.util.List;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import com.example.models.User;

public class CustomUserDetails implements UserDetails {

    private final User user;

    public CustomUserDetails(User user) {
        this.user = user;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        // Standard role
        String roleName = "ROLE_" + user.getRole().name().toUpperCase();
        
        // For customer role, also add ROLE_USER for compatibility
        if (user.getRole() == User.Role.customer) {
            return List.of(
                new SimpleGrantedAuthority(roleName),
                new SimpleGrantedAuthority("ROLE_USER")
            );
        }
        
        // For other roles, just return the standard role
        return List.of(new SimpleGrantedAuthority(roleName));
    }

    @Override
    public String getPassword() {
        return user.getPasswordHash(); // match your field name
    }

    @Override
    public String getUsername() {
        return user.getEmail(); // use email as username
    }

    @Override
    public boolean isAccountNonExpired() {
        return true; // customize if you store expired info
    }

    @Override
    public boolean isAccountNonLocked() {
        return !user.getIsBanned();
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true; // customize as needed
    }

    @Override
    public boolean isEnabled() {
        return true; // customize e.g. check a flag like !user.isBanned
    }

    // Add a getter for your User entity if needed
    public User getUser() {
        return user;
    }
}