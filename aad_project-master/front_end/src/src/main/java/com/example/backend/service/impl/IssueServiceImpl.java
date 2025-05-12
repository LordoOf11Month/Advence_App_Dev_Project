package com.example.backend.service.impl;

import com.example.backend.dto.IssueDTO;
import com.example.backend.entity.Issue;
import com.example.backend.entity.OrderItem;
import com.example.backend.entity.User;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.repository.IssueRepository;
import com.example.backend.repository.OrderItemRepository;
import com.example.backend.repository.UserRepository;
import com.example.backend.service.IssueService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class IssueServiceImpl implements IssueService {

    @Autowired
    private IssueRepository issueRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private UserRepository userRepository;

    @Override
    public IssueDTO createIssue(IssueDTO issueDTO, Authentication authentication) {
        OrderItem orderItem = orderItemRepository.findById(issueDTO.getOrderItemId())
                .orElseThrow(() -> new ResourceNotFoundException("Order item not found with id: " + issueDTO.getOrderItemId()));

        User user = (User) authentication.getPrincipal();
        Issue issue = new Issue(orderItem, user, issueDTO.getType(), issueDTO.getDescription(), "OPEN");
        Issue saved = issueRepository.save(issue);
        return mapToDTO(saved);
    }

    @Override
    public List<IssueDTO> getIssuesForUser(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        List<Issue> issues = issueRepository.findByUser(user);
        return issues.stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    @Override
    public List<IssueDTO> getAllIssues() {
        List<Issue> issues = issueRepository.findAll();
        return issues.stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    @Override
    public IssueDTO resolveIssue(Long id, Authentication authentication) {
        Issue issue = issueRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Issue not found with id: " + id));
        User admin = (User) authentication.getPrincipal();
        issue.setStatus("RESOLVED");
        issue.setResolvedBy(admin);
        Issue updated = issueRepository.save(issue);
        return mapToDTO(updated);
    }

    @Override
    public IssueDTO rejectIssue(Long id, Authentication authentication) {
        Issue issue = issueRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Issue not found with id: " + id));
        User admin = (User) authentication.getPrincipal();
        issue.setStatus("REJECTED");
        issue.setResolvedBy(admin);
        Issue updated = issueRepository.save(issue);
        return mapToDTO(updated);
    }

    private IssueDTO mapToDTO(Issue issue) {
        IssueDTO dto = new IssueDTO();
        dto.setId(issue.getId());
        dto.setOrderItemId(issue.getOrderItem().getId());
        dto.setUserEmail(issue.getUser().getEmail());
        dto.setType(issue.getType());
        dto.setDescription(issue.getDescription());
        dto.setStatus(issue.getStatus());
        if (issue.getResolvedBy() != null) {
            dto.setResolvedByEmail(issue.getResolvedBy().getEmail());
        }
        return dto;
    }
}
