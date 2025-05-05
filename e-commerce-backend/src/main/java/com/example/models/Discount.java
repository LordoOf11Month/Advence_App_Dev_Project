package com.example.models;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.io.Serializable;




@Entity
@Table(name = "discounts")
@Getter @Setter
public class Discount {
    @Embeddable
    @Getter @Setter
    public class DiscountId implements Serializable {
        @Column(name = "product_id")
        private Long productId;
    
        @Column(name = "banner_id")
        private Long bannerId;
    
        // override equals() & hashCode()...
    }
    
    @EmbeddedId
    private DiscountId id;
    
    @ManyToOne
    @MapsId("productId")
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;
    
    @ManyToOne
    @MapsId("bannerId")
    @JoinColumn(name = "banner_id", nullable = false)
    private Banner banner;
    
    @Column(name = "discount_percent", nullable = false)
    private Integer discountPercent;
}
