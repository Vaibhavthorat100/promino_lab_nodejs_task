# Prominno Labs - Admin & Seller APIs

This is a backend API service built using **Node.js, Express, and Supabase (PostgreSQL) with Prisma ORM**. It implements role-based authentication, validation, pagination, and dynamic PDF generation.

---

## Technical Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** Supabase (PostgreSQL)
- **ORM:** Prisma
- **Validation:** Zod
- **Authentication:** JSON Web Tokens (JWT) + bcryptjs
- **PDF Generation:** PDFKit

---

## Setup & Running Instructions

### 1. Pre-requisites
- Make sure you have **Node.js (v16+)** installed.
- Set up a **Supabase** project and get your PostgreSQL Database connection string.

### 2. Install Dependencies
Run the following command in the project directory:
```bash
npm install
```

### 3. Environment Variables Configuration
Open the `.env` file and replace the values with your credentials:
```env
PORT=3000
DATABASE_URL="YOUR_SUPABASE_POSTGRESQL_CONNECTION_STRING"
JWT_SECRET="YOUR_CUSTOM_SECRET_KEY"
```

### 4. Database Schema Sync (Prisma)
Run the Prisma command to create the database tables in Supabase:
```bash
npx prisma db push
```

### 5. Database Seeding (Create Admin)
Seed the database to create the default Admin account:
```bash
npx prisma db seed
```
* **Default Admin Credentials:**
  - **Email:** `admin@prominno.com`
  - **Password:** `admin123`

### 6. Run the Server
- **Development Mode (with auto-reload):**
  ```bash
  npm run dev
  ```
- **Production Mode:**
  ```bash
  npm start
  ```

---

## API Documentation

### Base URL: `http://localhost:3000/api/v1`

### 1. Admin API Endpoints

#### Login Admin
- **Endpoint:** `POST /admin/login`
- **Body:**
  ```json
  {
    "email": "admin@prominno.com",
    "password": "admin123"
  }
  ```
- **Response:** Returns JWT `token` and `role` ("admin").

#### Create Seller (Admin Only)
- **Endpoint:** `POST /admin/sellers`
- **Headers:** `Authorization: Bearer <ADMIN_TOKEN>`
- **Body:**
  ```json
  {
    "name": "Jane Doe",
    "email": "jane.seller@example.com",
    "mobileNo": "9876543210",
    "country": "India",
    "state": "Maharashtra",
    "skills": ["Communication", "Negotiation", "Sales"],
    "password": "sellerpassword123"
  }
  ```

#### List Sellers with Pagination (Admin Only)
- **Endpoint:** `GET /admin/sellers?page=1&limit=10`
- **Headers:** `Authorization: Bearer <ADMIN_TOKEN>`

---

### 2. Seller API Endpoints

#### Login Seller
- **Endpoint:** `POST /seller/login`
- **Body:**
  ```json
  {
    "email": "jane.seller@example.com",
    "password": "sellerpassword123"
  }
  ```
- **Response:** Returns JWT `token` and `role` ("seller").

#### Add Product with Brands (Seller Only)
- **Endpoint:** `POST /seller/products`
- **Headers:** `Authorization: Bearer <SELLER_TOKEN>`
- **Body:**
  ```json
  {
    "name": "Gaming Laptop Bundle",
    "description": "Premium high-performance gaming setup bundle with accessories.",
    "brands": [
      {
        "brandName": "ASUS ROG",
        "detail": "Intel i9, 32GB RAM, RTX 4080",
        "image": "https://images.unsplash.com/photo-1603302576837-37561b2e2302",
        "price": 2499.99
      },
      {
        "brandName": "Logitech G",
        "detail": "Pro X Wireless Mouse and Keyboard",
        "image": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
        "price": 299.99
      }
    ]
  }
  ```

#### List Seller's Products (Seller Only)
- **Endpoint:** `GET /seller/products?page=1&limit=10`
- **Headers:** `Authorization: Bearer <SELLER_TOKEN>`
- **Note:** Only shows products belonging to the logged-in seller.

#### View Product PDF (Seller Only)
- **Endpoint:** `GET /seller/products/:id/pdf`
- **Headers:** `Authorization: Bearer <SELLER_TOKEN>`
- **Response:** Serves an inline PDF containing product name, description, brand list with details, and total calculated price.

#### Delete Product (Seller Only)
- **Endpoint:** `DELETE /seller/products/:id`
- **Headers:** `Authorization: Bearer <SELLER_TOKEN>`
- **Note:** Seller can only delete their own products.
