// k6 Performance Test Script for OlanAlumint.web
// Tests critical endpoints for performance under load

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Trend, Counter, Rate } from 'k6/metrics';

// Custom metrics
const quoteResponseTime = new Trend('quote_response_time');
const productsResponseTime = new Trend('products_response_time');
const availableSlotsTime = new Trend('available_slots_response_time');
const errors = new Counter('errors');
const successRate = new Rate('success_rate');

// Test configuration
export const options = {
  stages: [
    // Ramp up to 50 users over 30s
    { duration: '30s', target: 50 },
    // Stay at 50 users for 1m
    { duration: '1m', target: 50 },
    // Ramp down to 0 over 30s
    { duration: '30s', target: 0 }
  ],
  thresholds: {
    // 95% of requests should be under 500ms
    http_req_duration: ['p(95)<500'],
    // Error rate should be < 1%
    errors: ['count<10'],
    // Success rate should be > 95%
    success_rate: ['rate>0.95']
  }
};

// Base URL - adjust for your environment
// eslint-disable-next-line no-undef
const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export default function () {
  // ============================================================
  // Health Check (baseline)
  // ============================================================

  group('Health Check', function () {
    const res = http.get(`${BASE_URL}/health`);
    check(res, {
      'health status is 200': (r) => r.status === 200,
      'health returns ok': (r) => r.json().status === 'ok'
    });
    successRate.add(res.status === 200);
    sleep(1);
  });

  // ============================================================
  // Products Endpoint (catalogue)
  // ============================================================

  group('Products Catalogue', function () {
    const res = http.get(`${BASE_URL}/api/v1/products`);
    const startTime = new Date();

    check(res, {
      'products status is 200': (r) => r.status === 200,
      'products has data': (r) => r.json().data !== undefined,
      'products has pagination': (r) => r.json().pagination !== undefined
    });

    productsResponseTime.add(res.timings.duration);
    successRate.add(res.status === 200);

    if (res.status !== 200) {
      errors.add(1);
    }

    sleep(0.5);
  });

  // ============================================================
  // Products Gallery Endpoint
  // ============================================================

  group('Products Gallery', function () {
    const res = http.get(`${BASE_URL}/api/v1/products/gallery`);

    check(res, {
      'gallery status is 200': (r) => r.status === 200
    });

    productsResponseTime.add(res.timings.duration);
    successRate.add(res.status === 200);

    if (res.status !== 200) {
      errors.add(1);
    }

    sleep(0.5);
  });

  // ============================================================
  // Quote Calculator Endpoint
  // ============================================================

  group('Quote Calculator', function () {
    const payload = JSON.stringify({
      product_id: 'window-standard',
      width_meters: 2,
      height_meters: 1.5,
      quantity: 2,
      double_glazing: false,
      finish: 'mill'
    });

    const params = {
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const res = http.post(`${BASE_URL}/api/v1/quote`, payload, params);

    check(res, {
      'quote status is 200': (r) => r.status === 200,
      'quote has subtotal': (r) => r.json().data?.subtotal_kes !== undefined,
      'quote has range estimate': (r) => r.json().data?.estimate_range_kes !== undefined
    });

    quoteResponseTime.add(res.timings.duration);
    successRate.add(res.status === 200);

    if (res.status !== 200) {
      errors.add(1);
    }

    sleep(0.5);
  });

  // ============================================================
  // Available Slots Endpoint
  // ============================================================

  group('Available Time Slots', function () {
    const res = http.get(`${BASE_URL}/api/v1/bookings/available-slots?date=2024-01-15`);

    check(res, {
      'slots status is 200': (r) => r.status === 200,
      'slots has data': (r) => r.json().data !== undefined
    });

    availableSlotsTime.add(res.timings.duration);
    successRate.add(res.status === 200);

    if (res.status !== 200) {
      errors.add(1);
    }

    sleep(0.5);
  });
}

// ============================================================
// Summary Report
// ============================================================

export function handleSummary(data) {
  return {
    stdout: textSummary(data)
  };
}

function textSummary(data) {
  const stats = data.metrics;

  return `
==============================================
       PERFORMANCE TEST SUMMARY
==============================================

Total Requests: ${data.root_group.hits}
Test Duration: ${data.state.testRunDuration}

Response Times (p95):
- Quote Endpoint: ${stats.quote_response_time ? stats.quote_response_time.p95 : 'N/A'} ms
- Products: ${stats.products_response_time ? stats.products_response_time.p95 : 'N/A'} ms
- Available Slots: ${stats.available_slots_response_time ? stats.available_slots_response_time.p95 : 'N/A'} ms

Success Rate: ${(stats.success_rate ? stats.success_rate.rate : 0) * 100}%
Errors: ${stats.errors ? stats.errors.count : 0}

Thresholds:
${JSON.stringify(data.thresholds, null, 2)}
==============================================
`;
}
