package com.example.backend.config;

import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/public")
@RequiredArgsConstructor
public class PublicConfigController {
    @Value("${stripe.publishable.key}")
    private String publishableKey;

    @GetMapping("/stripe-pk")
    public Map<String, String> getStripePk() {
        return Map.of("publishableKey", publishableKey);
    }
}
