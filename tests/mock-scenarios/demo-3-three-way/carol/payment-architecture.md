# Payment System Architecture — Carol's Proposal

## Overview
Design the payment processing system for our e-commerce platform.

## Architecture Decision
We should use a **serverless / event-driven architecture** using AWS Lambda functions and EventBridge. Each payment event triggers a chain of Lambda functions:

1. `initiate-payment` → validates input, creates payment record
2. `process-payment` → calls external provider (Stripe/PayPal)
3. `confirm-payment` → updates status, sends receipt
4. `reconcile-payment` → nightly batch reconciliation

## Supported Methods
- Credit/debit cards (Stripe)
- Digital wallets (Apple Pay, Google Pay via Stripe)
- No PayPal (too complex for Lambda cold start latency)

## Data Storage
DynamoDB for payment records (high throughput, auto-scaling). S3 for audit logs and receipts. No relational database needed.

## Security
- PCI DSS Level 1 compliance via Stripe Elements (client-side tokenization)
- AWS WAF for API Gateway protection
- IAM roles with least-privilege per Lambda function

## Error Handling
Step Functions state machine for orchestration. Failed steps automatically retry with configurable backoff. Dead letter queue (SQS) for permanently failed payments.

## Cost Model
Pay-per-invocation: estimated $0.002 per payment transaction at our current volume (50K/month). Scales automatically with zero ops overhead.
