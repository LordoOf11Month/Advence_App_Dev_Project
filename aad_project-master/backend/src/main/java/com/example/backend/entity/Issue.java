package com.example.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "issues")
@Getter
@Setter
@NoArgsConstructor
public class Issue {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "issue_id")
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "order_item_id", referencedColumnName = "order_item_id")
    private OrderItem orderItem;

    @ManyToOne(optional = false)
    @JoinColumn(name = "user_id", referencedColumnName = "user_id")
    private User user;

    private String type;
    private String description;
    private String status; // e.g., "OPEN", "RESOLVED", "REJECTED"

    @ManyToOne
    @JoinColumn(name = "resolved_by", referencedColumnName = "user_id")
    private User resolvedBy;

    public Issue(OrderItem orderItem, User user, String type, String description, String status) {
        this.orderItem = orderItem;
        this.user = user;
        this.type = type;
        this.description = description;
        this.status = status;
    }
} 