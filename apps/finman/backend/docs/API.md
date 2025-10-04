# FinMan API Documentation

Base URL: `http://localhost:3000/api`

## Authentication

### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword",
  "name": "John Doe"
}

Response: 201 Created
{
  "user": {
    "id": "abc123",
    "email": "user@example.com",
    "name": "John Doe"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword"
}

Response: 200 OK
{
  "user": {
    "id": "abc123",
    "email": "user@example.com",
    "name": "John Doe"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Get Current User
```http
GET /auth/me
Authorization: Bearer {token}

Response: 200 OK
{
  "id": "abc123",
  "email": "user@example.com",
  "name": "John Doe",
  "createdAt": "2025-10-04T10:00:00.000Z"
}
```

## Transactions

All transaction endpoints require authentication.

### Get All Transactions
```http
GET /transactions
Authorization: Bearer {token}

Response: 200 OK
[
  {
    "id": "txn123",
    "type": "expense",
    "amount": 45.50,
    "category": "Food & Dining",
    "description": "Lunch at restaurant",
    "date": "2025-10-04",
    "account": "Cash",
    "receiptPath": "receipts/user-abc/2025/10/receipt-1696435200000.jpg",
    "recurringId": null,
    "createdAt": "2025-10-04T12:00:00.000Z",
    "updatedAt": "2025-10-04T12:00:00.000Z"
  }
]
```

### Create Transaction (with receipt)
```http
POST /transactions
Authorization: Bearer {token}
Content-Type: multipart/form-data

FormData:
- type: "expense"
- amount: "45.50"
- category: "Food & Dining"
- description: "Lunch"
- date: "2025-10-04"
- account: "Cash"
- receipt: [file]

Response: 201 Created
{
  "id": "txn123",
  "type": "expense",
  "amount": 45.50,
  ...
}
```

### Update Transaction
```http
PUT /transactions/:id
Authorization: Bearer {token}
Content-Type: application/json

{
  "amount": 50.00,
  "description": "Updated description"
}

Response: 200 OK
```

### Delete Transaction
```http
DELETE /transactions/:id
Authorization: Bearer {token}

Response: 200 OK
{
  "message": "Transaction deleted successfully"
}
```

### Get Transaction Stats
```http
GET /transactions/stats
Authorization: Bearer {token}

Response: 200 OK
{
  "totalIncome": 5000.00,
  "totalExpense": 2500.00,
  "balance": 2500.00,
  "transactionCount": 145
}
```

## Budgets

### Get All Budgets
```http
GET /budgets
Authorization: Bearer {token}

Response: 200 OK
[
  {
    "id": "bdg123",
    "category": "Food & Dining",
    "amount": 500.00,
    "period": "monthly",
    "createdAt": "2025-10-01T00:00:00.000Z"
  }
]
```

### Create Budget
```http
POST /budgets
Authorization: Bearer {token}
Content-Type: application/json

{
  "category": "Food & Dining",
  "amount": 500.00,
  "period": "monthly"
}

Response: 201 Created
```

### Get Budget Progress
```http
GET /budgets/progress
Authorization: Bearer {token}

Response: 200 OK
[
  {
    "id": "bdg123",
    "category": "Food & Dining",
    "amount": 500.00,
    "period": "monthly",
    "spent": 350.00,
    "remaining": 150.00,
    "percentage": 70.00
  }
]
```

## Recurring Transactions

### Get All Recurring
```http
GET /recurring
Authorization: Bearer {token}

Response: 200 OK
[
  {
    "id": "rec123",
    "type": "income",
    "amount": 3000.00,
    "category": "Salary",
    "frequency": "monthly",
    "startDate": "2025-01-01",
    "nextDate": "2025-11-01",
    "isActive": true
  }
]
```

### Create Recurring Transaction
```http
POST /recurring
Authorization: Bearer {token}
Content-Type: application/json

{
  "type": "income",
  "amount": 3000.00,
  "category": "Salary",
  "description": "Monthly salary",
  "frequency": "monthly",
  "startDate": "2025-01-01",
  "account": "Bank",
  "isActive": true
}

Response: 201 Created
```

### Process Recurring Transactions
```http
POST /recurring/process
Authorization: Bearer {token}

Response: 200 OK
{
  "message": "Recurring transactions processed",
  "count": 3,
  "transactions": [...]
}
```

## Error Responses

### 400 Bad Request
```json
{
  "error": "Email and password are required",
  "status": "error"
}
```

### 401 Unauthorized
```json
{
  "error": "Invalid token",
  "status": "error"
}
```

### 404 Not Found
```json
{
  "error": "Transaction not found",
  "status": "error"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error",
  "status": "error"
}
```

## File Uploads

Receipt images are stored on the server filesystem and served via:
```
GET http://localhost:3000/uploads/receipts/user-abc/2025/10/receipt-1696435200000.jpg
```

**Allowed formats:** JPEG, PNG, GIF, WebP  
**Max file size:** 5 MB (configurable)

## Rate Limiting

API endpoints are rate-limited to prevent abuse. Default: 100 requests per 15 minutes per IP.
