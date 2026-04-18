# Payment System Architecture — Alice's Proposal

## Overview
Design the payment processing system for our e-commerce platform.

## Architecture Decision
We should use a **microservices architecture** with dedicated services for each payment method:
- `payment-gateway`: Routes to the correct processor
- `payment-stripe`: Handles Stripe payments
- `payment-paypal`: Handles PayPal payments
- `payment-crypto`: Handles cryptocurrency payments

## Data Storage
Each service manages its own database (database-per-service pattern). We use PostgreSQL for transactional data and Redis for caching payment status.

## Security
- PCI DSS Level 1 compliance required
- All card data encrypted at rest (AES-256)
- Tokenization via Stripe — we never store raw card numbers

## Error Handling
Circuit breaker pattern for external payment provider calls. Retry with exponential backoff (max 3 retries).
