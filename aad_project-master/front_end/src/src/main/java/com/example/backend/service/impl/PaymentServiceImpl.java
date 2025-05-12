package com.example.backend.service.impl;

import com.example.backend.entity.Order;
import com.example.backend.entity.Payment;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.repository.OrderRepository;
import com.example.backend.repository.PaymentRepository;
import com.example.backend.repository.TransactionRepository;
import com.example.backend.service.PaymentService;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.model.Refund;
import com.stripe.param.PaymentIntentCreateParams;
import com.stripe.param.RefundCreateParams;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import com.example.backend.entity.Transaction;
import com.example.backend.entity.User;

import jakarta.annotation.PostConstruct;
import java.util.List;

@Service
public class PaymentServiceImpl implements PaymentService {

    @Value("${stripe.api.key}")
    private String stripeApiKey;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private TransactionRepository transactionRepository;
    
    @Autowired
    private javax.sql.DataSource dataSource;
    
    @PostConstruct
    public void init() {
        Stripe.apiKey = stripeApiKey;
    }

    @Override
    @Transactional
    public String createPaymentIntent(Long orderId) {
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        // Check if order already has a payment
        if (paymentRepository.findByOrder(order).isPresent()) {
            throw new RuntimeException("Payment already created for this order");
        }

        // Convert total amount to cents (assuming USD)
        long amount = order.getTotalAmount().multiply(new BigDecimal(100)).longValue();

        try {
            PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                    .setAmount(amount)
                    .setCurrency("usd")
                    .setDescription("Payment for Order #" + orderId)
                    .setReceiptEmail(order.getUser().getEmail())
                    .setAutomaticPaymentMethods(
                        PaymentIntentCreateParams.AutomaticPaymentMethods.builder()
                            .setEnabled(true)
                            .build()
                    )
                    .build();
            
            PaymentIntent intent = PaymentIntent.create(params);

            // Save Payment record with PENDING status
            Payment payment = new Payment(order, order.getTotalAmount(), "STRIPE", intent.getId(), "PENDING");
            paymentRepository.save(payment);

            return intent.getClientSecret();
        } catch (StripeException e) {
            throw new RuntimeException("Stripe API error: " + e.getMessage());
        }
    }

    @Override
    @Transactional
    public void confirmPayment(String paymentIntentId) {
        try {
            PaymentIntent intent = PaymentIntent.retrieve(paymentIntentId);
            
            if ("succeeded".equals(intent.getStatus())) {
                Payment payment = paymentRepository.findByTransactionId(paymentIntentId)
                    .orElseThrow(() -> new ResourceNotFoundException("Payment not found for intent: " + paymentIntentId));
                
                // Check if payment is already completed to avoid duplicate processing
                if ("COMPLETED".equals(payment.getStatus())) {
                    return;
                }
                
                // Update payment status
                payment.setStatus("COMPLETED");
                payment = paymentRepository.save(payment);
                
                // Update order status
                Order order = payment.getOrder();
                order.setShipmentStatus("CONFIRMED");
                order = orderRepository.save(order);
                
                // Check if transaction already exists for this payment
                List<Transaction> existingTransactions = transactionRepository.findByPayment(payment);
                if (existingTransactions.isEmpty()) {
                    try {
                        Transaction transaction = createTransaction(order, payment);
                        if (transaction != null && transaction.getId() != null) {
                            System.out.println("Transaction created successfully: " + transaction.getId());
                        } else {
                            System.out.println("Transaction creation failed - transaction was null or had no ID");
                        }
                    } catch (Exception e) {
                        System.err.println("Transaction creation failed with exception: " + e.getMessage());
                        e.printStackTrace();
                        throw new RuntimeException("Failed to create transaction: " + e.getMessage(), e);
                    }
                } else {
                    System.out.println("Transaction already exists for payment: " + payment.getId());
                }
            } else {
                System.out.println("Payment intent not succeeded: " + intent.getStatus());
            }
        } catch (StripeException e) {
            System.err.println("Failed to confirm payment: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to confirm payment: " + e.getMessage());
        }
    }

    @Override
    @Transactional
    public void processRefund(Long orderId) {
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        Payment payment = paymentRepository.findByOrder(order)
            .orElseThrow(() -> new ResourceNotFoundException("Payment not found for order id: " + orderId));

        try {
            RefundCreateParams params = RefundCreateParams.builder()
                    .setPaymentIntent(payment.getTransactionId())
                    .build();
            Refund refund = Refund.create(params);

            payment.setStatus("REFUNDED");
            paymentRepository.save(payment);
            
            order.setShipmentStatus("CANCELLED");
            orderRepository.save(order);
        } catch (StripeException e) {
            throw new RuntimeException("Stripe API error: " + e.getMessage());
        }
    }

    @Override
    @Transactional
    public boolean ensureTransactionExists(Long orderId) {
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        Payment payment = paymentRepository.findByOrder(order)
            .orElseThrow(() -> new ResourceNotFoundException("Payment not found for order id: " + orderId));

        List<Transaction> existingTransactions = transactionRepository.findByPayment(payment);
        if (!existingTransactions.isEmpty()) {
            System.out.println("Transaction already exists for order: " + orderId);
            return false;
        }

        if (!"COMPLETED".equals(payment.getStatus())) {
            System.out.println("Payment not completed yet for order: " + orderId + ", status: " + payment.getStatus());
            payment.setStatus("COMPLETED");
            paymentRepository.save(payment);
        }

        try {
            Transaction transaction = createTransaction(order, payment);
            System.out.println("Transaction manually created for order: " + orderId);
            return true;
        } catch (Exception e) {
            System.err.println("Failed to manually create transaction: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to create transaction: " + e.getMessage(), e);
        }
    }

    private Transaction createTransaction(Order order, Payment payment) {
        try {
            if (order.getItems() == null || order.getItems().isEmpty()) {
                System.err.println("Order has no items: " + order.getId());
                throw new RuntimeException("Order has no items");
            }
            
            User buyer = order.getUser();
            if (buyer == null) {
                System.err.println("Order has no user: " + order.getId());
                throw new RuntimeException("Order has no associated user");
            }
            
            User seller = null;
            try {
                seller = order.getItems().get(0).getProduct().getStore().getSeller();
            } catch (Exception e) {
                System.err.println("Could not get seller from order: " + e.getMessage());
                throw new RuntimeException("Failed to get seller");
            }
            
            if (seller == null) {
                System.err.println("Could not determine seller for order: " + order.getId());
                throw new RuntimeException("No seller found for order");
            }
            
            System.out.println("Creating transaction with order ID: " + order.getId() + 
                               ", payment ID: " + payment.getId() + 
                               ", buyer ID: " + buyer.getId() + 
                               ", seller ID: " + seller.getId());
            
            Transaction tx = new Transaction();
            tx.setOrder(order);
            tx.setPayment(payment);
            tx.setBuyer(buyer);
            tx.setSeller(seller);
            tx.setAmount(payment.getAmount());
            tx.setPaymentStatus(payment.getStatus());
            tx.setShipmentStatus(order.getShipmentStatus());
            tx.setCreatedAt(LocalDateTime.now());
            
            try {
                Transaction savedTx = transactionRepository.save(tx);
                System.out.println("Transaction saved with ID: " + savedTx.getId());
                return savedTx;
            } catch (Exception e) {
                System.err.println("JPA transaction save failed: " + e.getMessage());
                e.printStackTrace();
                
                // Fallback to direct JDBC
                try {
                    return insertTransactionWithJdbc(tx, order, payment, buyer, seller);
                } catch (Exception jdbcEx) {
                    System.err.println("JDBC transaction save also failed: " + jdbcEx.getMessage());
                    jdbcEx.printStackTrace();
                    throw jdbcEx;
                }
            }
        } catch (Exception e) {
            System.err.println("Failed to create transaction: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to create transaction: " + e.getMessage(), e);
        }
    }
    
    private Transaction insertTransactionWithJdbc(Transaction tx, Order order, Payment payment, User buyer, User seller) throws Exception {
        String sql = "INSERT INTO transactions (order_id, payment_id, buyer_id, seller_id, amount, payment_status, shipment_status, created_at) " +
                     "VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        
        try (java.sql.Connection conn = dataSource.getConnection();
             java.sql.PreparedStatement pstmt = conn.prepareStatement(sql, java.sql.Statement.RETURN_GENERATED_KEYS)) {
            
            pstmt.setLong(1, order.getId());
            pstmt.setLong(2, payment.getId());
            pstmt.setLong(3, buyer.getId());
            pstmt.setLong(4, seller.getId());
            pstmt.setBigDecimal(5, tx.getAmount());
            pstmt.setString(6, tx.getPaymentStatus());
            pstmt.setString(7, tx.getShipmentStatus());
            pstmt.setTimestamp(8, java.sql.Timestamp.valueOf(tx.getCreatedAt()));
            
            int rowsAffected = pstmt.executeUpdate();
            System.out.println("JDBC insert affected " + rowsAffected + " rows");
            
            if (rowsAffected > 0) {
                java.sql.ResultSet rs = pstmt.getGeneratedKeys();
                if (rs.next()) {
                    long id = rs.getLong(1);
                    tx.setId(id);
                    System.out.println("JDBC insert generated ID: " + id);
                    return tx;
                }
            }
            
            throw new RuntimeException("JDBC insert did not return generated keys");
        }
    }
}