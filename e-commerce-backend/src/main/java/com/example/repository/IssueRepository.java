package com.example.repository;

import com.example.model.Issue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IssueRepository extends JpaRepository<Issue, Integer> {
    List<Issue> findByOrderItemId(int orderItemId);
    List<Issue> findByUserId(int userId);
}