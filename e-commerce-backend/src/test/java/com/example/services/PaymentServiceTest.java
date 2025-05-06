package com.example.services;

import com.example.DTO.PaymentDTO;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.model.Refund;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class PaymentServiceTest {

    @Mock
    private PaymentIntent mockPaymentIntent;
    
    @Mock
    private Refund mockRefund;
    
    @InjectMocks
    private PaymentService paymentService;
    
    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        ReflectionTestUtils.setField(paymentService, "stripeKey", "test_key");
    }
    
    @Test
    void createPaymentIntent_Success() throws StripeException {
        PaymentDTO.PaymentRequest request = new PaymentDTO.PaymentRequest();
        request.setAmount(1000L);
        request.setCurrency("usd");
        
        when(mockPaymentIntent.getClientSecret()).thenReturn("test_secret");
        when(mockPaymentIntent.create(any())).thenReturn(mockPaymentIntent);
        
        String result = paymentService.createPaymentIntent(request);
        
        assertEquals("test_secret", result);
        verify(mockPaymentIntent).create(any());
    }
    
    @Test
    void createPaymentIntent_StripeException() throws StripeException {
        PaymentDTO.PaymentRequest request = new PaymentDTO.PaymentRequest();
        request.setAmount(1000L);
        request.setCurrency("usd");
        
        when(mockPaymentIntent.create(any())).thenThrow(new StripeException("Test error"));
        
        assertThrows(StripeException.class, () -> paymentService.createPaymentIntent(request));
    }
    
    @Test
    void refundPayment_Success() throws StripeException {
        when(mockRefund.create(any())).thenReturn(mockRefund);
        
        Refund result = paymentService.refundPayment("test_intent", 1000L);
        
        assertNotNull(result);
        verify(mockRefund).create(any());
    }
    
    @Test
    void refundPayment_StripeException() throws StripeException {
        when(mockRefund.create(any())).thenThrow(new StripeException("Test error"));
        
        assertThrows(StripeException.class, () -> paymentService.refundPayment("test_intent", 1000L));
    }
}