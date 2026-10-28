# Limitations

This is a demonstration implementation of the ShareLab API. The following features are faked or cut:

## Payments
- No payment processing for resource bookings or fines
- No monetary transactions handled

## Email
- No email notifications sent
- Notification system is in-memory only (stored in database, but no actual email delivery)
- Password reset emails not implemented

## Multi-institution Support
- Single-institution only
- No support for multiple colleges or departments within the system
- All resources belong to one shared lab environment

## Automatic Photo Comparison
- Condition report photos are stored but not automatically compared
- No computer vision or image analysis for damage detection
- Manual review required for condition assessments

## Analytics
- No usage analytics or reporting dashboard
- No heatmaps of resource usage
- No statistics on bookings, returns, or incidents

## Concurrent File Uploads
- File upload handling is basic; no chunked upload resuming
- No progress tracking for uploads
- No virus scanning of uploaded files

## Real-time Features
- No WebSocket-based real-time updates
- No live waitlist position updates
- No real-time availability indicators

## Resource Categories Beyond Basic Text
- Categories are simple strings, not hierarchical or tagged
- No category search facets beyond exact match

## Scheduled Command Detailed Behavior
- The `sharelab:expire-offers` command exists but basic implementation
- Exact expiry logic and next-offer-in-line behavior needs refinement
- Idempotency guarantees for scheduled commands need verification

## Database Constraints
- Some enum values may be validated server-side only
- Foreign key enforcement depends on MariaDB configuration
- No soft delete usage for certain models (audit_logs are append-only by design)

## Testing Coverage
- Not all edge cases are covered by the test suite
- Some boundary conditions may not be tested
- Concurrency tests are simplified

## SPA Fallback
- Frontend React app building and serving is documented but not included in this repository
- Vite configuration is set up but frontend source code is separate

## User Sessions
- Session management uses Sanctum bearer tokens
- Remember me functionality not implemented
- Token blacklisting not implemented