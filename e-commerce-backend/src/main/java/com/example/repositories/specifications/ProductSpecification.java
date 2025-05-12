package com.example.repositories.specifications;

import java.util.ArrayList;
import java.util.List;

import org.springframework.data.jpa.domain.Specification;

import com.example.DTO.ProductDTO.ProductFilterRequest;
import com.example.models.Product;

import jakarta.persistence.criteria.Predicate;

public class ProductSpecification {

    public static Specification<Product> filterBy(ProductFilterRequest filter) {
        return (root, query, criteriaBuilder) -> {
            Predicate predicate = criteriaBuilder.conjunction(); // Default predicate: `true`

            // Handle "search" parameter for title & description
            if (filter.getSearch() != null && !filter.getSearch().isBlank()) {
                String[] searchWords = filter.getSearch().trim().toLowerCase().split("\\s+"); // Split by spaces
                List<Predicate> searchPredicates = new ArrayList<>();

                for (String word : searchWords) {
                    Predicate titleMatch = criteriaBuilder.like(criteriaBuilder.lower(root.get("name")), "%" + word + "%");
                    Predicate descriptionMatch = criteriaBuilder.like(criteriaBuilder.lower(root.get("description")), "%" + word + "%");
                    searchPredicates.add(criteriaBuilder.or(titleMatch, descriptionMatch));
                }

                // Combine all the search word predicates with AND logic
                predicate = criteriaBuilder.and(predicate, criteriaBuilder.and(searchPredicates.toArray(new Predicate[0])));
            }

            // Minimum Price
            if (filter.getMinPrice() != null) {
                predicate = criteriaBuilder.and(predicate,
                    criteriaBuilder.greaterThanOrEqualTo(root.get("price"), filter.getMinPrice()));
            }

            // Maximum Price
            if (filter.getMaxPrice() != null) {
                predicate = criteriaBuilder.and(predicate,
                    criteriaBuilder.lessThanOrEqualTo(root.get("price"), filter.getMaxPrice()));
            }

            // Minimum Rating
            if (filter.getMinRating() != null) {
                predicate = criteriaBuilder.and(predicate,
                    criteriaBuilder.greaterThanOrEqualTo(root.get("averageRating"), filter.getMinRating()));
            }

            // Categories filter (assuming a Many-to-One relationship with Category)
            if (filter.getCategories() != null && !filter.getCategories().isEmpty()) {
                predicate = criteriaBuilder.and(predicate,
                    root.join("category").get("name").in(filter.getCategories()));
            }

            // Free Shipping filter
            if (filter.getFreeShipping() != null) {
                predicate = criteriaBuilder.and(predicate,
                    criteriaBuilder.equal(root.get("freeShipping"), filter.getFreeShipping()));
            }

            // Fast Delivery filter
            if (filter.getFastDelivery() != null) {
                predicate = criteriaBuilder.and(predicate,
                    criteriaBuilder.equal(root.get("fastDelivery"), filter.getFastDelivery()));
            }

            return predicate;
        };
    }
}