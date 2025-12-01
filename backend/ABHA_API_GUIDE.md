# 🏥 ABHA API Integration Guide

Complete guide for ABHA (Ayushman Bharat Health Account) user management in GlucoSage backend.

---

## 📋 Table of Contents

1. [Setup & Seeding](#setup--seeding)
2. [API Endpoints](#api-endpoints)
3. [Frontend Integration](#frontend-integration)
4. [Testing](#testing)
5. [Sample Data](#sample-data)

---

## 🚀 Setup & Seeding

### Step 1: Seed Sample ABHA Users

Run this command to populate your MongoDB with 6 sample users who have ABHA IDs:

```bash
npm run seed:abha
```

**What this does:**
- Connects to MongoDB
- Deletes existing sample users (if any)
- Inserts 6 users with realistic ABHA numbers
- Displays all inserted users

**Expected Output:**
```
╔═══════════════════════════════════════════════════╗
║        🏥 ABHA Users Seeding Script              ║
╚═══════════════════════════════════════════════════╝

✅ Successfully inserted 6 users!

1. Rohit Sinha
   📧 Email: rohit.sinha@example.com
   🆔 ABHA Number: 1011-2233-4455-6677
   📬 ABHA Address: rohit.sinha@abdm
   ...
```

---

## 🔌 API Endpoints

### Base URL
```
http://localhost:5000/api/users
```

---

### 1. **GET /api/users** - Get All Users

Fetch all users in the system.

**Request:**
```bash
GET http://localhost:5000/api/users
```

**Response (200 OK):**
```json
{
  "success": true,
  "count": 6,
  "data": [
    {
      "_id": "67890abcdef...",
      "name": "Rohit Sinha",
      "email": "rohit.sinha@example.com",
      "age": 45,
      "gender": "male",
      "abhaNumber": "1011-2233-4455-6677",
      "abhaAddress": "rohit.sinha@abdm",
      "abhaLinked": true,
      "diagnosisType": "Type 2 Diabetes",
      "createdAt": "2025-11-30T..."
    }
  ]
}
```

---

### 2. **GET /api/users/:id** - Get User by ID

Fetch a specific user by their MongoDB ID.

**Request:**
```bash
GET http://localhost:5000/api/users/67890abcdef1234567890abc
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "_id": "67890abcdef...",
    "name": "Kavita Joshi",
    "email": "kavita.joshi@example.com",
    "age": 52,
    "gender": "female",
    "abhaNumber": "3033-4455-6677-8899",
    "abhaAddress": "kavita.joshi@abdm",
    "abhaLinked": true
  }
}
```

---

### 3. **PATCH /api/users/:id/abha** - Link/Update ABHA ⭐

Link or update ABHA information for a user.

**Request:**
```bash
PATCH http://localhost:5000/api/users/67890abcdef1234567890abc/abha
Content-Type: application/json

{
  "abhaNumber": "1011-2233-4455-6677",
  "abhaAddress": "newuser@abdm"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "ABHA information linked successfully",
  "data": {
    "_id": "67890abcdef...",
    "name": "Test User",
    "abhaNumber": "1011-2233-4455-6677",
    "abhaAddress": "newuser@abdm",
    "abhaLinked": true
  }
}
```

**Validation Rules:**
- ABHA Number format: `XXXX-XXXX-XXXX-XXXX` (16 digits with hyphens)
- ABHA Address format: `username@abdm`
- At least one field (number or address) must be provided
- ABHA numbers must be unique across users

**Error Responses:**

**400 Bad Request - Invalid Format:**
```json
{
  "success": false,
  "message": "Invalid ABHA Number format. Expected format: XXXX-XXXX-XXXX-XXXX"
}
```

**409 Conflict - Duplicate ABHA:**
```json
{
  "success": false,
  "message": "This ABHA Number is already linked to another user"
}
```

**404 Not Found:**
```json
{
  "success": false,
  "message": "User not found"
}
```

---

### 4. **DELETE /api/users/:id/abha** - Unlink ABHA

Remove ABHA information from a user.

**Request:**
```bash
DELETE http://localhost:5000/api/users/67890abcdef1234567890abc/abha
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "ABHA information unlinked successfully",
  "data": {
    "_id": "67890abcdef...",
    "name": "Test User",
    "abhaNumber": null,
    "abhaAddress": null,
    "abhaLinked": false
  }
}
```

---

### 5. **GET /api/users/abha/linked** - Get ABHA Linked Users

Fetch only users who have ABHA linked.

**Request:**
```bash
GET http://localhost:5000/api/users/abha/linked
```

**Response (200 OK):**
```json
{
  "success": true,
  "count": 6,
  "data": [
    {
      "_id": "67890abcdef...",
      "name": "Rohit Sinha",
      "abhaNumber": "1011-2233-4455-6677",
      "abhaLinked": true
    }
  ]
}
```

---

## 🎨 Frontend Integration

### Plain JavaScript / Fetch API

```javascript
// Link ABHA from Frontend
async function linkAbha(userId, abhaNumber, abhaAddress) {
  try {
    const response = await fetch(`http://localhost:5000/api/users/${userId}/abha`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        abhaNumber: abhaNumber,
        abhaAddress: abhaAddress
      })
    });

    const data = await response.json();
    
    if (data.success) {
      console.log('✅ ABHA linked successfully:', data.data);
      alert('ABHA linked successfully!');
    } else {
      console.error('❌ Error:', data.message);
      alert(`Error: ${data.message}`);
    }
  } catch (error) {
    console.error('Network error:', error);
    alert('Failed to link ABHA. Please check your connection.');
  }
}

// Usage
linkAbha('67890abcdef1234567890abc', '1011-2233-4455-6677', 'rohit@abdm');
```

---

### React + Axios

```typescript
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Link ABHA
export const linkAbhaToUser = async (
  userId: string, 
  abhaNumber?: string, 
  abhaAddress?: string
) => {
  try {
    const response = await axios.patch(
      `${API_BASE_URL}/users/${userId}/abha`,
      {
        abhaNumber,
        abhaAddress
      }
    );
    
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to link ABHA');
    }
    throw error;
  }
};

// Get all users
export const getAllUsers = async () => {
  const response = await axios.get(`${API_BASE_URL}/users`);
  return response.data;
};

// Get user by ID
export const getUserById = async (userId: string) => {
  const response = await axios.get(`${API_BASE_URL}/users/${userId}`);
  return response.data;
};

// Unlink ABHA
export const unlinkAbhaFromUser = async (userId: string) => {
  const response = await axios.delete(`${API_BASE_URL}/users/${userId}/abha`);
  return response.data;
};
```

**React Component Example:**

```typescript
import { useState } from 'react';
import { linkAbhaToUser } from './services/userService';

function LinkAbhaForm({ userId }: { userId: string }) {
  const [abhaNumber, setAbhaNumber] = useState('');
  const [abhaAddress, setAbhaAddress] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await linkAbhaToUser(userId, abhaNumber, abhaAddress);
      alert('✅ ABHA linked successfully!');
      console.log(result);
    } catch (error: any) {
      alert(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="ABHA Number (1011-2233-4455-6677)"
        value={abhaNumber}
        onChange={(e) => setAbhaNumber(e.target.value)}
        pattern="\d{4}-\d{4}-\d{4}-\d{4}"
      />
      
      <input
        type="text"
        placeholder="ABHA Address (username@abdm)"
        value={abhaAddress}
        onChange={(e) => setAbhaAddress(e.target.value)}
        pattern="[\w.-]+@abdm"
      />
      
      <button type="submit" disabled={loading}>
        {loading ? 'Linking...' : 'Link ABHA'}
      </button>
    </form>
  );
}
```

---

## 🧪 Testing with Postman

### Collection Structure

1. **Get All Users**
   - Method: `GET`
   - URL: `http://localhost:5000/api/users`

2. **Get User by ID**
   - Method: `GET`
   - URL: `http://localhost:5000/api/users/{{userId}}`

3. **Link ABHA**
   - Method: `PATCH`
   - URL: `http://localhost:5000/api/users/{{userId}}/abha`
   - Body (JSON):
     ```json
     {
       "abhaNumber": "1011-2233-4455-6677",
       "abhaAddress": "test@abdm"
     }
     ```

4. **Unlink ABHA**
   - Method: `DELETE`
   - URL: `http://localhost:5000/api/users/{{userId}}/abha`

5. **Get ABHA Linked Users**
   - Method: `GET`
   - URL: `http://localhost:5000/api/users/abha/linked`

---

## 📊 Sample Data

After running `npm run seed:abha`, you'll have these users:

| Name | Email | ABHA Number | ABHA Address | Age | Gender | Diagnosis |
|------|-------|-------------|--------------|-----|--------|-----------|
| Rohit Sinha | rohit.sinha@example.com | 1011-2233-4455-6677 | rohit.sinha@abdm | 45 | Male | Type 2 Diabetes |
| Manish Deshmukh | manish.deshmukh@example.com | 2022-3344-5566-7788 | manish.deshmukh@abdm | 38 | Male | Type 1 Diabetes |
| Kavita Joshi | kavita.joshi@example.com | 3033-4455-6677-8899 | kavita.joshi@abdm | 52 | Female | Type 2 Diabetes |
| Shalini Mehta | shalini.mehta@example.com | 4044-5566-7788-9900 | shalini.mehta@abdm | 62 | Female | Type 2 Diabetes |
| Rajesh Nair | rajesh.nair@example.com | 5055-6677-8899-0011 | rajesh.nair@abdm | 48 | Male | Pre-Diabetes |
| Sunita Sharma | sunita.sharma@example.com | 6066-7788-9900-1122 | sunita.sharma@abdm | 35 | Female | Gestational Diabetes |

**Default Password:** `Test@123` (for all users)

---

## ✅ Final Behavior Summary

After completing the setup:

1. ✅ **Database has 6 sample users** with ABHA IDs
2. ✅ **Fetch all users** via `GET /api/users`
3. ✅ **Link/update ABHA** from frontend using `PATCH /api/users/:id/abha`
4. ✅ **Validate ABHA format** (number and address)
5. ✅ **Prevent duplicate ABHA** linking
6. ✅ **Unlink ABHA** if needed
7. ✅ **Filter ABHA-linked users** easily

---

## 🔐 Security Notes

⚠️ **For Production:**
- Protect these routes with authentication middleware
- Add authorization checks (users should only update their own ABHA)
- Implement rate limiting
- Use HTTPS only
- Validate ABHA with actual ABDM APIs

---

## 📝 Quick Start Checklist

- [ ] Run `npm run seed:abha`
- [ ] Verify users in MongoDB
- [ ] Test `GET /api/users` in Postman
- [ ] Test `PATCH /api/users/:id/abha` with sample data
- [ ] Integrate with frontend onboarding flow
- [ ] Add authentication before production deployment

---

**Happy Coding! 🚀**
