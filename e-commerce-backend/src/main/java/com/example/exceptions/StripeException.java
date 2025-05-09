package com.example.exceptions;

import com.stripe.model.StripeError;
import lombok.Generated;

public abstract class StripeException extends Exception {
    private static final long serialVersionUID = 2L;
    transient StripeError stripeError;
    private String code;
    private String requestId;
    private Integer statusCode;

    protected StripeException(String message, String requestId, String code, Integer statusCode) {
        super(message);
        this.requestId = requestId;
        this.code = code;
        this.statusCode = statusCode;
    }

    protected StripeException(String message, String requestId, String code, Integer statusCode, Throwable e) {
        super(message, e);
        this.requestId = requestId;
        this.code = code;
        this.statusCode = statusCode;
    }

    @Override
    public String getMessage() {
        return super.getMessage();
    }

    public String getUserMessage() {
        if (stripeError != null && stripeError.getMessage() != null) {
            return stripeError.getMessage();
        }
        return getMessage();
    }

    @Generated
    public StripeError getStripeError() {
        return this.stripeError;
    }

    @Generated
    public String getCode() {
        return this.code;
    }

    @Generated
    public String getRequestId() {
        return this.requestId;
    }

    @Generated
    public Integer getStatusCode() {
        return this.statusCode;
    }

    @Generated
    public void setStripeError(StripeError stripeError) {
        this.stripeError = stripeError;
    }
}