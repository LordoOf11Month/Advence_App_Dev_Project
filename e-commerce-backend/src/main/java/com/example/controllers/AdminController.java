package com.example.controllers;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class AdminController {

    @GetMapping("/admin/dashboard")
    public String getDashboardMetrics() {
        return "Dashboard metrics";
    }

    @GetMapping("/admin/reports")
    public String generateReports() {
        return "Reports generated";
    }
}