package com.example.backend.repository;

import com.example.backend.entity.Issue;
import com.example.backend.entity.OrderItem;
import com.example.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface IssueRepository extends JpaRepository<Issue, Long> {
    List<Issue> findByOrderItem(OrderItem orderItem);
    List<Issue> findByUser(User user);
    List<Issue> findByStatus(String status);
} 