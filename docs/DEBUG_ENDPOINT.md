# Debug Endpoint Implementation - Security & Usage Guide

## Overview

The `/api/debug-storage` endpoint provides a secure way to verify storage configuration and connectivity in both development and production environments.

## Problem Solved

Previously, the debug endpoint returned a hard 403 error in production:
```json
{"ok":false,"error":"Debug endpoint not available in production"}
```

This made it impossible to diagnose storage issues in production environments. The new implementation allows authenticated access to sanitized debug information in production while maintaining security.

## Implementation Details

### Security Model

#### Development/Test Environments
- **No authentication required**
- Full debug information exposed (including MySQL configuration status)
- Detailed error messages with error codes
- Accessible at: `http://localhost:3000/api/debug-storage`

#### Production Environment
- **Authentication required** via `DEBUG_API_KEY` environment variable
- Only basic, sanitized information exposed
- Generic error messages (no sensitive details)
- Two authentication methods supported:
  1. Authorization header: `Authorization: Bearer <key>`
  2. Query parameter: `?key=<key>`

### Access Control Flow

```
┌─────────────────────────────────────┐
│  Request to /api/debug-storage      │
└────────────┬────────────────────────┘
             │
             ▼
     ┌───────────────┐
     │ Production?   │
     └───┬───────┬───┘
   No    │       │    Yes
         │       │
         │       ▼
         │   ┌──────────────────┐
         │   │ DEBUG_API_KEY    │
         │   │ configured?      │
         │   └───┬──────────┬───┘
         │   No  │          │ Yes
         │       │          │
         │       ▼          ▼
         │   403 Forbidden  Check key match
         │                  │
         │              ┌───┴───┐
         │              │       │
         │          Match?  No Match
         │              │       │
         │              ▼       ▼
         │          Success  401 Unauthorized
         │              │
         └──────────────┘
```

### Response Format

#### Success Response (Development)
```json
{
  "ok": true,
  "storage_type": "sqlite",
  "tasks_count": 42,
  "can_read": true,
  "message": "Storage is working!",
  "mysql_host": "configured",
  "mysql_database": "configured"
}
```

#### Success Response (Production)
```json
{
  "ok": true,
  "storage_type": "sqlite",
  "tasks_count": 42,
  "can_read": true,
  "message": "Storage is working!"
}
```

#### Error Response (No Auth in Production)
```json
{
  "ok": false,
  "error": "Debug endpoint not available in production"
}
```
Status: 403

#### Error Response (Invalid Auth)
```json
{
  "ok": false,
  "error": "Unauthorized"
}
```
Status: 401

#### Error Response (Storage Failure - Development)
```json
{
  "ok": false,
  "storage_type": "mysql",
  "error": "Connection failed: ECONNREFUSED",
  "error_code": "ECONNREFUSED",
  "mysql_configured": true
}
```
Status: 500

#### Error Response (Storage Failure - Production)
```json
{
  "ok": false,
  "storage_type": "mysql",
  "error": "Storage initialization failed"
}
```
Status: 500

## Configuration

### Environment Variables

Add to `.env.local` or your deployment environment:

```bash
# Optional: Only needed for production debug access
# Generate with: openssl rand -hex 32
DEBUG_API_KEY=your_secure_random_key_here
```

### Example Values

```bash
# Development (no key needed)
# Just run the app normally

# Production (with debug access)
DEBUG_API_KEY=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
```

## Usage Examples

### Development Environment

```bash
# Simple GET request
curl http://localhost:3000/api/debug-storage

# Returns full debug info without authentication
```

### Production Environment

#### Without DEBUG_API_KEY configured
```bash
curl https://your-app.com/api/debug-storage

# Returns: {"ok":false,"error":"Debug endpoint not available in production"}
# Status: 403
```

#### With Authorization Header
```bash
curl -H "Authorization: Bearer YOUR_KEY" \
  https://your-app.com/api/debug-storage

# Returns: Sanitized debug info
# Status: 200
```

#### With Query Parameter
```bash
curl "https://your-app.com/api/debug-storage?key=YOUR_KEY"

# Returns: Sanitized debug info
# Status: 200
```

## Security Best Practices

### ✅ DO

1. **Use a strong random key**: Generate with `openssl rand -hex 32` or similar
2. **Store key securely**: Use environment variables, never commit to git
3. **Rotate keys periodically**: Change the key every few months
4. **Use HTTPS**: Always access production endpoints over HTTPS
5. **Monitor access logs**: Watch for unauthorized access attempts
6. **Limit access**: Only share the key with authorized personnel

### ❌ DON'T

1. **Don't use weak keys**: Avoid simple strings like "debug123"
2. **Don't commit keys**: Never add keys to version control
3. **Don't share publicly**: Don't post keys in issues, chat, etc.
4. **Don't reuse keys**: Use unique keys for each environment
5. **Don't log keys**: Ensure keys aren't logged by your app
6. **Don't expose in URLs**: Prefer Authorization header over query params when possible

## Monitoring & Troubleshooting

### Common Issues

#### "Debug endpoint not available in production"
- **Cause**: `DEBUG_API_KEY` not set in production environment
- **Solution**: Set the environment variable and redeploy

#### "Unauthorized"
- **Cause**: Wrong key provided or key mismatch
- **Solution**: Verify the key matches your environment variable

#### "Storage initialization failed"
- **Cause**: Database connection issue
- **Solution**: Check database credentials and connectivity in logs

### Logging

The endpoint logs to console (server-side):
```
[Debug] Storage Type: sqlite
[Debug] MySQL Host: Set
[Debug] MySQL Database: Set
```

Check your server logs for these messages when troubleshooting.

## Testing

Run the test suite:
```bash
npm test -- __tests__/debug-storage-api.test.ts
```

Tests cover:
- ✅ Production without DEBUG_API_KEY (403)
- ✅ Production with wrong key (401)
- ✅ Production with no key (401)
- ✅ Production with correct key via query param (200)
- ✅ Production with correct key via header (200)
- ✅ Development without auth (200)
- ✅ Test environment without auth (200)

## Migration Guide

### Upgrading from Previous Version

No breaking changes! The endpoint works exactly as before if you don't set `DEBUG_API_KEY`:

**Before:**
```
Production: 403 "Debug endpoint not available in production"
Development: 200 with full debug info
```

**After (without DEBUG_API_KEY):**
```
Production: 403 "Debug endpoint not available in production" (SAME)
Development: 200 with full debug info (SAME)
```

**After (with DEBUG_API_KEY):**
```
Production: 200 with sanitized info (NEW - when authenticated)
Development: 200 with full debug info (SAME)
```

## API Reference

### Endpoint
```
GET /api/debug-storage
```

### Authentication (Production Only)

**Header:**
```
Authorization: Bearer <DEBUG_API_KEY>
```

**Query Parameter:**
```
?key=<DEBUG_API_KEY>
```

### Response Codes

- `200`: Success
- `401`: Unauthorized (wrong or missing key)
- `403`: Forbidden (DEBUG_API_KEY not configured)
- `500`: Server error (storage failure)

### Rate Limiting

No rate limiting implemented. Consider adding rate limiting if the endpoint is exposed to untrusted networks.

## Future Enhancements

Possible improvements for future versions:

1. **IP Whitelisting**: Restrict access to specific IP ranges
2. **Rate Limiting**: Prevent brute force attempts
3. **Audit Logging**: Log all access attempts with timestamps
4. **Multiple Keys**: Support multiple API keys with different permissions
5. **Key Rotation**: Automatic key rotation mechanism
6. **Webhook Notifications**: Alert on failed auth attempts
