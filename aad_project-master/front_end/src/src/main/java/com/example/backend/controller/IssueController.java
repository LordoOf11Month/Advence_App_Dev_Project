package com.example.backend.controller;

import com.example.backend.dto.ApiResponse;
import com.example.backend.dto.IssueDTO;
import com.example.backend.service.IssueService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/issues")
public class IssueController {

    @Autowired
    private IssueService issueService;

    @PostMapping
    public ResponseEntity<ApiResponse<IssueDTO>> createIssue(@RequestBody IssueDTO issueDTO, Authentication authentication) {
        IssueDTO createdIssue = issueService.createIssue(issueDTO, authentication);
        return ResponseEntity.ok(ApiResponse.success("Issue reported successfully", createdIssue));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<IssueDTO>>> getUserIssues(Authentication authentication) {
        List<IssueDTO> issues = issueService.getIssuesForUser(authentication);
        return ResponseEntity.ok(ApiResponse.success(issues));
    }

    @GetMapping("/all")
    @PreAuthorize("hasRole('PLATFORM_ADMIN')")
    public ResponseEntity<ApiResponse<List<IssueDTO>>> getAllIssues() {
        List<IssueDTO> issues = issueService.getAllIssues();
        return ResponseEntity.ok(ApiResponse.success(issues));
    }

    @PutMapping("/{id}/resolve")
    @PreAuthorize("hasRole('PLATFORM_ADMIN')")
    public ResponseEntity<ApiResponse<IssueDTO>> resolveIssue(@PathVariable Long id, Authentication authentication) {
        IssueDTO resolved = issueService.resolveIssue(id, authentication);
        return ResponseEntity.ok(ApiResponse.success("Issue resolved successfully", resolved));
    }

    @PutMapping("/{id}/reject")
    @PreAuthorize("hasRole('PLATFORM_ADMIN')")
    public ResponseEntity<ApiResponse<IssueDTO>> rejectIssue(@PathVariable Long id, Authentication authentication) {
        IssueDTO rejected = issueService.rejectIssue(id, authentication);
        return ResponseEntity.ok(ApiResponse.success("Issue rejected", rejected));
    }
}
