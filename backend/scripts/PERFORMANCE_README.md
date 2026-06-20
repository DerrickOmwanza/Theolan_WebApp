# Performance Testing Guide

## k6 Load Testing

This directory contains performance test scripts for the OlanAlumint.web API.

### Prerequisites

- Install [k6](https://k6.io/docs/getting-started/installation/) (v0.50+)
- Backend server running (`npm run dev` in backend directory)

### Running Tests

```bash
# Run with default settings (localhost:3000)
k6 run scripts/performance-test.js

# Run against staging environment
k6 run -e BASE_URL=https://api.staging.theolan.co.ke scripts/performance-test.js

# Run with custom VU count
k6 run --vus 100 --duration 60s scripts/performance-test.js
```

### Test Scenarios

| Scenario | Description | Target |
|----------|-------------|--------|
| Products Catalogue | GET /api/v1/products | p95 < 200ms |
| Products Gallery | GET /api/v1/products/gallery | p95 < 200ms |
| Quote Calculator | POST /api/v1/quote | p95 < 500ms |
| Available Slots | GET /api/v1/bookings/available-slots | p95 < 300ms |
| Health Check | GET /health | p95 < 100ms |

### Thresholds

- 95% of requests < 500ms
- Error rate < 1%
- Success rate > 95%

### Metrics Collected

| Metric | Description |
|--------|-------------|
| `quote_response_time` | Quote calculation endpoint latency |
| `products_response_time` | Products catalogue latency |
| `available_slots_response_time` | Time slots endpoint latency |
| `errors` | Total error count |
| `success_rate` | Percentage of successful requests |

### Example Output

```
==============================================
       PERFORMANCE TEST SUMMARY
==============================================

Total Requests: 3000
Test Duration: 2m

Response Times (p95):
- Quote Endpoint: 142 ms
- Products: 23 ms
- Available Slots: 89 ms

Success Rate: 100%
Errors: 0

Thresholds: All passed
==============================================
```