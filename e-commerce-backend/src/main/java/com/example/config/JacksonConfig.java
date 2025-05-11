package com.example.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.converter.json.Jackson2ObjectMapperBuilder;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;

@Configuration
public class JacksonConfig {
    
    @Bean
    public ObjectMapper objectMapper(Jackson2ObjectMapperBuilder builder) {
        ObjectMapper objectMapper = builder.build();
        
        // Register JavaTimeModule for proper date handling
        objectMapper.registerModule(new JavaTimeModule());
        
        // Try to register Hibernate module if available, but don't fail if not present
        try {
            // Use reflection to avoid direct class reference which could cause ClassNotFoundException
            Class<?> hibernateModuleClass = Class.forName("com.fasterxml.jackson.datatype.hibernate5.jakarta.Hibernate5JakartaModule");
            Object hibernateModule = hibernateModuleClass.getDeclaredConstructor().newInstance();
            objectMapper.registerModule((com.fasterxml.jackson.databind.Module) hibernateModule);
        } catch (Exception e) {
            // Log but continue - the application can function without the Hibernate module
            System.out.println("Hibernate Jackson module not available, skipping: " + e.getMessage());
        }
        
        objectMapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        
        return objectMapper;
    }
} 