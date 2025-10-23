# Payment and Subscription Test Plan

This document outlines the test cases to validate the payment and subscription status fixes.

## Test Scenarios

### 1. Course Purchase Flow

#### Test Case 1.1: Single Course Purchase
1. **Setup**: Log in as a test user
2. **Action**: Purchase a single course using Stripe Checkout
3. **Verification**:
   - Payment status should be `COMPLETED` in the database
   - User should be automatically enrolled in the course
   - User should have access to the course content

#### Test Case 1.2: Course Purchase with Failed Payment
1. **Setup**: Log in as a test user
2. **Action**: Attempt to purchase a course but use a test card that fails
3. **Verification**:
   - Payment record should either not exist or remain in `PENDING` status
   - User should not have access to the course content

### 2. Subscription Flow

#### Test Case 2.1: New Subscription
1. **Setup**: Log in as a test user
2. **Action**: Subscribe to Premium plan
3. **Verification**:
   - Payment status should be `COMPLETED` in the database
   - Subscription status should be `ACTIVE` in the database
   - User should have Premium badge and access to all eligible courses

#### Test Case 2.2: Subscription with Failed Payment
1. **Setup**: Log in as a test user
2. **Action**: Attempt to subscribe but use a test card that fails
3. **Verification**:
   - Payment record should either not exist or remain in `PENDING` status
   - Subscription status should not be `ACTIVE`
   - User should not have Premium access

#### Test Case 2.3: Subscription Renewal
1. **Setup**: Log in as a test user with existing subscription
2. **Action**: Simulate a subscription renewal using Stripe test webhook
3. **Verification**:
   - New payment record should be created with status `COMPLETED`
   - Subscription status should remain `ACTIVE`
   - Subscription period end date should be extended

#### Test Case 2.4: Subscription Cancellation (at period end)
1. **Setup**: Log in as a test user with active subscription
2. **Action**: Cancel subscription (at period end)
3. **Verification**:
   - Subscription status should remain `ACTIVE`
   - `cancelAtPeriodEnd` flag should be `true`
   - User should still have access until period end
   - After period end date passes, status should become `CANCELED`

#### Test Case 2.5: Subscription Immediate Cancellation
1. **Setup**: Log in as a test user with active subscription
2. **Action**: Cancel subscription immediately
3. **Verification**:
   - Subscription status should change to `CANCELED`
   - User should immediately lose Premium access

## Testing Methods

### Manual Testing
- Use Stripe test cards for different scenarios
- Use test webhook events to simulate renewals and failures

### Webhook Testing
Use Stripe CLI to simulate webhook events:
```bash
stripe trigger checkout.session.completed
stripe trigger customer.subscription.updated
stripe trigger invoice.payment_succeeded
stripe trigger invoice.payment_failed
```

### Database Verification
Run the following queries to verify database state:
```sql
-- Check payment status
SELECT * FROM Payment WHERE userId = '[test-user-id]' ORDER BY createdAt DESC LIMIT 5;

-- Check subscription status
SELECT * FROM Subscription WHERE userId = '[test-user-id]';

-- Check enrollment status
SELECT * FROM Enrollment WHERE userId = '[test-user-id]';
```

## Post-Fix Monitoring

After the fixes are deployed, monitor:
1. Payment status transitions in production
2. Subscription status changes
3. Access control decisions for Premium content
4. Any errors in webhook handling

## Rollback Plan

If issues are detected:
1. Record the specific problem observed
2. Determine if the issue is with a specific event type
3. If needed, revert the changes to the specific webhook handler
4. Re-test with the original implementation to confirm the issue is resolved