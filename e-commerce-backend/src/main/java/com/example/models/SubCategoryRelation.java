package com.example.models;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "sub_category_relations")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
public class SubCategoryRelation {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;
    
    @ManyToOne
    @JoinColumn(name = "ancestor_id", nullable = false)
    private Category ancestor;
    
    @ManyToOne
    @JoinColumn(name = "descendant_id", nullable = false)
    private Category descendant;
    
    @Column(nullable = false)
    private int depth;
    
    public SubCategoryRelation(Category ancestor, Category descendant, int depth) {
        this.ancestor = ancestor;
        this.descendant = descendant;
        this.depth = depth;
    }
}
    
