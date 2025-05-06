package com.example.services;

import com.example.DTO.PaymentDTO;
import com.stripe.exception.ApiException;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.model.Refund;
import com.stripe.param.PaymentIntentCreateParams;
import com.stripe.param.RefundCreateParams;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PaymentServiceTest {

    @Mock
    private PaymentIntent mockPaymentIntent;
    
    @Mock
    private Refund mockRefund;
    
    @InjectMocks
    private PaymentService paymentService;
    
    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(paymentService, "stripeKey", "test_key");
    }
    
    @Test
    void createPaymentIntent_Success() throws StripeException {
        // Create a standalone instance of PaymentRequest
        PaymentDTO paymentDTO = new PaymentDTO();
        PaymentDTO.PaymentRequest request = paymentDTO.new PaymentRequest();
        request.setAmount(1000L);
        request.setCurrency("usd");
        
        try (MockedStatic<PaymentIntent> mockedPaymentIntent = Mockito.mockStatic(PaymentIntent.class)) {
            mockedPaymentIntent.when(() -> PaymentIntent.create(any(PaymentIntentCreateParams.class)))
                    .thenReturn(mockPaymentIntent);
            when(mockPaymentIntent.getClientSecret()).thenReturn("test_secret");
            
            String result = paymentService.createPaymentIntent(request);
            
            assertEquals("test_secret", result);
            mockedPaymentIntent.verify(() -> PaymentIntent.create(any(PaymentIntentCreateParams.class)));
        }
    }
    
    @Test
    void createPaymentIntent_StripeException() throws StripeException {
        // Create a standalone instance of PaymentRequest
        PaymentDTO paymentDTO = new PaymentDTO();
        PaymentDTO.PaymentRequest request = paymentDTO.new PaymentRequest();
        request.setAmount(1000L);
        request.setCurrency("usd");
        
        try (MockedStatic<PaymentIntent> mockedPaymentIntent = Mockito.mockStatic(PaymentIntent.class)) {
            mockedPaymentIntent.when(() -> PaymentIntent.create(any(PaymentIntentCreateParams.class)))
                    .thenThrow(new ApiException("Test error", "error_code", "param", null, null));
            
            assertThrows(StripeException.class, () -> paymentService.createPaymentIntent(request));
        }
    }
    
    @Test
    void refundPayment_Success() throws StripeException {
        try (MockedStatic<Refund> mockedRefund = Mockito.mockStatic(Refund.class)) {
            mockedRefund.when(() -> Refund.create(any(RefundCreateParams.class)))
                    .thenReturn(mockRefund);
            
            Refund result = paymentService.refundPayment("test_intent", 1000L);
            
            assertNotNull(result);
            mockedRefund.verify(() -> Refund.create(any(RefundCreateParams.class)));
        }
    }
    
    @Test
    void refundPayment_StripeException() throws StripeException {
        try (MockedStatic<Refund> mockedRefund = Mockito.mockStatic(Refund.class)) {
            mockedRefund.when(() -> Refund.create(any(RefundCreateParams.class)))
                    .thenThrow(new ApiException("Test error", "error_code", "param", null, null));
            
            assertThrows(StripeException.class, () -> paymentService.refundPayment("test_intent", 1000L));
        }
    }
}