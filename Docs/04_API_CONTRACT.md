# API Contract — Theolan Aluminium International Ltd

**Version:** 1.0  
**Base URL:** `https://api.olanallumint.co.ke` (production)  
**Base URL (Dev):** `http://localhost:3000`  
**Spec Format:** REST + JSON  
**Authentication:** JWT (Bearer token)

---

## Authentication Endpoints

### POST /api/v1/auth/signup

**Purpose:** Register new client account.

**Request:**
```json
{
  "phone": "+254712345678",
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "accept_sms_consent": true
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Signup successful. Verify OTP sent to phone.",
  "data": {
    "user_id": "uuid-here",
    "phone": "+254712345678",
    "otp_expires_in_seconds": 600
  }
}
```

**Response (409 Conflict):**
```json
{
  "success": false,
  "error": "PHONE_EXISTS",
  "message": "Phone number already registered"
}
```

**Validation:**
- `phone`: Required, format `+254XXXXXXXXX` (11 digits total)
- `name`: Required, 2-100 characters
- `email`: Optional, valid email format
- `password`: Required, min 8 chars, uppercase, lowercase, digit, special char
- `accept_sms_consent`: Required (true)

---

### POST /api/v1/auth/verify-otp

**Purpose:** Verify OTP code sent during signup or password reset.

**Request:**
```json
{
  "phone": "+254712345678",
  "code": "123456"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "OTP verified successfully",
  "data": {
    "user_id": "uuid-here",
    "phone_verified": true
  }
}
```

**Response (400 Bad Request):**
```json
{
  "success": false,
  "error": "INVALID_OTP",
  "message": "Code is incorrect or expired"
}
```

---

### POST /api/v1/auth/login

**Purpose:** Authenticate user and return JWT tokens.

**Request:**
```json
{
  "phone": "+254712345678",
  "password": "SecurePass123!"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIs...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "uuid-here",
      "phone": "+254712345678",
      "name": "John Doe",
      "role": "client"
    }
  }
}
```

**Response (401 Unauthorized):**
```json
{
  "success": false,
  "error": "INVALID_CREDENTIALS",
  "message": "Phone or password is incorrect"
}
```

---

### POST /api/v1/auth/refresh-token

**Purpose:** Generate new access token using refresh token.

**Request Headers:**
```
Authorization: Bearer <refresh_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIs...",
    "expires_in": 900
  }
}
```

---

### POST /api/v1/auth/forgot-password

**Purpose:** Request password reset (sends OTP to phone).

**Request:**
```json
{
  "phone": "+254712345678"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Reset OTP sent to phone"
}
```

---

### POST /api/v1/auth/reset-password

**Purpose:** Reset password using OTP.

**Request:**
```json
{
  "phone": "+254712345678",
  "code": "123456",
  "new_password": "NewSecurePass456!"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

---

## Booking Endpoints

### POST /api/v1/bookings

**Purpose:** Create site visit booking.

**Request Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "service_type": "windows",
  "property_type": "residential",
  "location": "Karen, Nairobi",
  "scheduled_at": "2024-01-20T14:30:00Z",
  "contact_method": "sms",
  "notes": "3 windows, ground floor"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Booking confirmed",
  "data": {
    "id": "uuid-here",
    "client_id": "uuid-here",
    "reference_number": "BKG001",
    "scheduled_at": "2024-01-20T14:30:00Z",
    "status": "scheduled",
    "sms_confirmation_sent": true
  }
}
```

**Validation:**
- `service_type`: Must be in (windows, doors, curtain_wall, partitions, balustrades, glazing)
- `scheduled_at`: Must be future date + available time slot
- `contact_method`: Must be in (sms, whatsapp, email)

---

### GET /api/v1/bookings

**Purpose:** List client's bookings.

**Request Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `status`: Optional filter (scheduled, completed, cancelled)
- `limit`: Default 20, max 100
- `offset`: Default 0 (for pagination)

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-here",
      "reference_number": "BKG001",
      "service_type": "windows",
      "scheduled_at": "2024-01-20T14:30:00Z",
      "status": "scheduled",
      "assigned_technician": {
        "name": "Kevin",
        "phone": "+254712345678"
      }
    }
  ],
  "pagination": {
    "total": 5,
    "limit": 20,
    "offset": 0
  }
}
```

---

### PATCH /api/v1/bookings/{id}

**Purpose:** Cancel or modify booking.

**Request Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "status": "cancelled",
  "reason": "Schedule conflict"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "uuid-here",
    "status": "cancelled"
  }
}
```

---

## Order Endpoints

### GET /api/v1/orders

**Purpose:** List client's orders.

**Request Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `status`: Optional filter (quoted, confirmed, fabrication, ready, installed)
- `limit`: Default 20
- `offset`: Default 0

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-here",
      "reference_number": "ORD001",
      "product_summary": "3x Sliding Doors, Black Finish",
      "status": "fabrication",
      "total_price_kes": 125000,
      "paid_amount_kes": 25000,
      "payment_status": "deposit_received",
      "created_at": "2024-01-10T10:00:00Z",
      "updated_at": "2024-01-15T14:00:00Z",
      "scheduled_installation_at": "2024-01-25T09:00:00Z"
    }
  ],
  "pagination": {
    "total": 3,
    "limit": 20,
    "offset": 0
  }
}
```

---

### GET /api/v1/orders/{id}

**Purpose:** Get order detail with timeline.

**Request Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "uuid-here",
    "reference_number": "ORD001",
    "product_summary": "3x Sliding Doors, Black Finish",
    "dimensions_notes": "W2m × H2.5m each",
    "status": "fabrication",
    "total_price_kes": 125000,
    "paid_amount_kes": 25000,
    "payment_status": "deposit_received",
    "assigned_technician": {
      "id": "uuid-here",
      "name": "Kevin",
      "phone": "+254712345678"
    },
    "timeline": [
      {
        "id": "uuid-here",
        "title": "Order confirmed",
        "description": null,
        "occurred_at": "2024-01-10T10:30:00Z",
        "is_current": false
      },
      {
        "id": "uuid-here",
        "title": "Deposit received",
        "description": "KES 25,000",
        "occurred_at": "2024-01-11T14:00:00Z",
        "is_current": false
      },
      {
        "id": "uuid-here",
        "title": "Fabrication started",
        "description": null,
        "occurred_at": "2024-01-12T09:00:00Z",
        "is_current": true
      }
    ]
  }
}
```

---

### PATCH /api/v1/orders/{id}

**Purpose:** Admin updates order status (also updates timeline).

**Request Headers:**
```
Authorization: Bearer <access_token>
Role: admin
```

**Request Body:**
```json
{
  "status": "ready",
  "milestone_title": "Ready for installation",
  "milestone_description": "All parts fabricated and quality checked"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "uuid-here",
    "status": "ready",
    "updated_at": "2024-01-18T10:00:00Z"
  }
}
```

---

## Quote Estimator Endpoints

### POST /api/v1/quote

**Purpose:** Calculate instant estimate for product.

**Request:**
```json
{
  "product_id": "uuid-here",
  "width_meters": 2.0,
  "height_meters": 2.5,
  "quantity": 3,
  "double_glazing": true,
  "finish": "black"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "product_name": "Sliding Window",
    "dimensions": {
      "width_m": 2.0,
      "height_m": 2.5,
      "area_sqm": 5.0
    },
    "quantity": 3,
    "total_area_sqm": 15.0,
    "base_rate_per_sqm": 8000,
    "double_glazing_multiplier": 1.35,
    "finish_multiplier": 1.15,
    "subtotal_kes": 155250,
    "estimate_min_kes": 143481,
    "estimate_max_kes": 166518,
    "estimate_range_kes": {
      "min": 143481,
      "max": 166518
    },
    "disclaimer": "This is an estimate. Final quote after site survey."
  }
}
```

**Validation:**
- `width_meters`: > 0.5, < 10
- `height_meters`: > 0.5, < 10
- `quantity`: >= 1, <= 100

---

## Product & Gallery Endpoints

### GET /api/v1/products

**Purpose:** Get product catalogue (public, filtered).

**Query Parameters:**
- `category`: Optional (windows, doors, curtain_walls, partitions, balustrades)
- `finish`: Optional (mill, silver, black, champagne, bronze)
- `sort_by`: Optional (price_asc, price_desc, name)
- `limit`: Default 20

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-here",
      "name": "Fixed Window — Single Pane",
      "category": "windows",
      "finish": "silver",
      "description": "...",
      "base_price_per_sqm_kes": 8000,
      "image_url": "https://cloudinary.com/..."
    }
  ]
}
```

---

### GET /api/v1/gallery

**Purpose:** Get public gallery photos (published only).

**Query Parameters:**
- `category`: Optional
- `finish`: Optional
- `search`: Optional keyword
- `limit`: Default 20

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-here",
      "category": "windows",
      "finish": "black",
      "project_name": "Karen Residence",
      "location": "Karen, Nairobi",
      "image_url": "https://cloudinary.com/...",
      "uploaded_at": "2024-01-15T10:00:00Z"
    }
  ]
}
```

---

### POST /api/v1/gallery (Admin)

**Purpose:** Upload project photo.

**Request Headers:**
```
Authorization: Bearer <access_token>
Role: admin
Content-Type: multipart/form-data
```

**Request Body (Form Data):**
- `file`: Binary image file (JPG/PNG, max 10MB)
- `category`: windows | doors | curtain_walls | partitions | balustrades
- `finish`: mill | silver | black | champagne | bronze
- `project_name`: String (optional)
- `location`: String (optional)

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "uuid-here",
    "image_url": "https://cloudinary.com/...",
    "published": false,
    "message": "Photo uploaded. Publish from Gallery Manager."
  }
}
```

---

## Payment Endpoints

### POST /api/v1/payments/initiate-stk

**Purpose:** Trigger M-Pesa STK Push for payment.

**Request Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "order_id": "uuid-here",
  "amount_kes": 25000,
  "phone_number": "+254712345678"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "checkout_request_id": "ws_CO_DMZ_12345678901234567890",
    "message": "STK push sent. Enter PIN on your phone.",
    "expires_in_seconds": 120
  }
}
```

---

### POST /api/v1/payments/mpesa-callback

**Purpose:** Webhook for M-Pesa payment callback (Safaricom initiates).

**Request Headers:**
```
Content-Type: application/json
X-Safaricom-Signature: <HMAC signature>
```

**Request Body (Safaricom payload):**
```json
{
  "Body": {
    "stkCallback": {
      "MerchantRequestID": "1234-567890-1",
      "CheckoutRequestID": "ws_CO_DMZ_12345678901234567890",
      "ResultCode": 0,
      "ResultDesc": "The service request has been processed successfully.",
      "CallbackMetadata": {
        "Item": [
          { "Name": "Amount", "Value": 25000 },
          { "Name": "MpesaReceiptNumber", "Value": "LHD1AS2KK3" },
          { "Name": "TransactionDate", "Value": 20240115140000 },
          { "Name": "PhoneNumber", "Value": 254712345678 }
        ]
      }
    }
  }
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "result_code": 0
}
```

**Webhook Processing:**
- Verify signature using Safaricom API key
- If ResultCode = 0 (success):
  - Create payment record with mpesa_receipt
  - Update order.payment_status = 'deposit_received' or 'paid_in_full'
  - Append order_event to timeline
  - Send SMS confirmation via Africa's Talking
  - Return { result_code: 0 }
- Else (failed):
  - Return { result_code: <error_code> }

---

## Admin Endpoints

### GET /api/v1/admin/orders

**Purpose:** List all orders (admin view).

**Request Headers:**
```
Authorization: Bearer <access_token>
Role: admin
```

**Query Parameters:**
- `status`: Optional filter
- `technician_id`: Optional filter
- `payment_status`: Optional filter
- `limit`: Default 50
- `offset`: Default 0

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-here",
      "client": {
        "id": "uuid-here",
        "name": "John Doe",
        "phone": "+254712345678"
      },
      "product_summary": "3x Sliding Doors",
      "status": "fabrication",
      "total_price_kes": 125000,
      "paid_amount_kes": 25000,
      "assigned_technician": { "name": "Kevin" }
    }
  ],
  "metrics": {
    "total_orders": 45,
    "quoted": 8,
    "confirmed": 12,
    "fabrication": 15,
    "ready": 7,
    "installed": 3
  }
}
```

---

### PATCH /api/v1/admin/orders/{id}

**Purpose:** Update order status, reassign technician, add milestones.

**Request Headers:**
```
Authorization: Bearer <access_token>
Role: admin
```

**Request Body:**
```json
{
  "status": "ready",
  "assigned_technician_id": "uuid-here",
  "milestone_title": "Ready for installation",
  "milestone_description": "Quality check completed"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "uuid-here",
    "status": "ready",
    "assigned_technician_id": "uuid-here"
  }
}
```

---

### GET /api/v1/admin/bookings-calendar

**Purpose:** Get week view of site visits with technician assignments.

**Query Parameters:**
- `week_offset`: Default 0 (current week), can be +/- weeks
- `technician_id`: Optional filter to single technician

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "week_start": "2024-01-15",
    "week_end": "2024-01-21",
    "visits": [
      {
        "id": "uuid-here",
        "client_name": "John Doe",
        "scheduled_at": "2024-01-15T10:00:00Z",
        "assigned_technician": {
          "name": "Kevin",
          "color_code": "#0055CC"
        },
        "status": "scheduled"
      }
    ],
    "metrics": {
      "total_visits": 18,
      "unassigned": 2,
      "completed": 3
    }
  }
}
```

---

### GET /api/v1/admin/clients

**Purpose:** CRM client list with status and lifetime value.

**Query Parameters:**
- `status`: Optional (lead, active, repeat)
- `sort_by`: Optional (ltv_desc, last_contact, name)
- `search`: Optional name/phone search
- `limit`: Default 50

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-here",
      "user": {
        "name": "John Doe",
        "phone": "+254712345678"
      },
      "status": "repeat",
      "lifetime_value_kes": 450000,
      "order_count": 3,
      "last_contact_at": "2024-01-15T14:00:00Z",
      "notes_count": 5
    }
  ]
}
```

---

### GET /api/v1/admin/clients/{id}

**Purpose:** CRM detail view with contact history.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "uuid-here",
    "user": {
      "name": "John Doe",
      "phone": "+254712345678",
      "email": "john@example.com"
    },
    "status": "repeat",
    "lifetime_value_kes": 450000,
    "orders": [
      { "id": "uuid-here", "reference_number": "ORD001", "status": "installed", "total_kes": 125000 }
    ],
    "notes": [
      { "id": "uuid-here", "text": "Prefers SMS over calls", "created_by": "Admin User", "created_at": "2024-01-10T10:00:00Z" }
    ]
  }
}
```

---

### POST /api/v1/admin/clients/{id}/notes

**Purpose:** Add note to client CRM record.

**Request Body:**
```json
{
  "note_text": "Installation completed successfully. Client very satisfied."
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "uuid-here",
    "note_text": "Installation completed successfully. Client very satisfied.",
    "created_at": "2024-01-18T10:00:00Z"
  }
}
```

---

## Admin Quotation Generator

### POST /api/v1/admin/invoices/generate-pdf

**Purpose:** Generate formal PDF quotation.

**Request Headers:**
```
Authorization: Bearer <access_token>
Role: admin
```

**Request Body:**
```json
{
  "order_id": "uuid-here",
  "include_terms": true
}
```

**Response (200 OK with PDF):**
```
Content-Type: application/pdf
Content-Disposition: attachment; filename="ORD001_Quotation.pdf"
```

---

## Error Responses

### 400 Bad Request

```json
{
  "success": false,
  "error": "VALIDATION_ERROR",
  "message": "Invalid request data",
  "details": {
    "field": "phone",
    "issue": "Must match format +254XXXXXXXXX"
  }
}
```

### 401 Unauthorized

```json
{
  "success": false,
  "error": "UNAUTHORIZED",
  "message": "Invalid or expired token"
}
```

### 403 Forbidden

```json
{
  "success": false,
  "error": "FORBIDDEN",
  "message": "Admins only"
}
```

### 404 Not Found

```json
{
  "success": false,
  "error": "NOT_FOUND",
  "message": "Order not found"
}
```

### 409 Conflict

```json
{
  "success": false,
  "error": "CONFLICT",
  "message": "Phone number already registered"
}
```

### 500 Internal Server Error

```json
{
  "success": false,
  "error": "INTERNAL_ERROR",
  "message": "An unexpected error occurred",
  "reference": "ERR_abc123def456"
}
```

---

## Rate Limiting

**Policy:**
- 100 requests per minute per IP (global)
- 50 requests per minute per authenticated user
- Booking/Quote endpoints: 20 requests per minute (prevent spam)

**Headers Returned:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1642281600
```

**Response (429 Too Many Requests):**
```json
{
  "success": false,
  "error": "RATE_LIMITED",
  "message": "Too many requests. Try again in 45 seconds."
}
```

---

## Testing Credentials (Sandbox)

**Client Account:**
- Phone: +254712345678
- Password: TestPass123!

**Admin Account:**
- Phone: +254798765432
- Password: AdminPass456!

**M-Pesa Sandbox:**
- Test Phone: 254712345678 (without +)
- Amount: 1 KES (sandbox only)

---

## Next Steps

1. Backend team implements all endpoints using Express.js
2. Frontend team integrates API client with React Query
3. Integration tests verify all request/response contracts
4. Performance testing on all endpoints
5. Deployment to Railway/AWS

---

**Status:** API contract ready for implementation.
