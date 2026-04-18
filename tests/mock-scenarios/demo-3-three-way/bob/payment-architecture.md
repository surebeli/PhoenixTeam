# Payment System Architecture — Bob's Proposal

## Overview
Design the payment processing system for our e-commerce platform.

## Architecture Decision
We should use a **monolithic approach** with a single payment service that handles all payment methods internally. This is simpler to deploy, debug, and maintain for our current team size (3 backend developers).

## Supported Methods
The single `PaymentService` class handles:
- Credit/debit cards (via Stripe SDK)
- PayPal (via PayPal REST API)
- Bank transfers (via Plaid)

## Data Storage
Single PostgreSQL database with tables: `payments`, `refunds`, `payment_methods`, `audit_log`. All in one schema for easy joins and reporting.

## Security
- PCI DSS Level 2 (SAQ A-EP) — sufficient for our volume
- Stripe handles all card data — we only store tokens
- TLS 1.3 for all API communication

## Error Handling
Simple retry logic (max 2 retries) with dead letter queue for failed payments. Manual review for stuck transactions.
