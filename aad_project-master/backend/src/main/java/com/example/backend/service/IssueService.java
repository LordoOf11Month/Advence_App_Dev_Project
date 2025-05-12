package com.example.backend.service;

import com.example.backend.dto.IssueDTO;
import org.springframework.security.core.Authentication;
import java.util.List;

public interface IssueService {
    IssueDTO createIssue(IssueDTO issueDTO, Authentication authentication);
    List<IssueDTO> getIssuesForUser(Authentication authentication);
    List<IssueDTO> getAllIssues();
    IssueDTO resolveIssue(Long id, Authentication authentication);
    IssueDTO rejectIssue(Long id, Authentication authentication);
}
