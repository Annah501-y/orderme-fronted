OrderMe — Frontend

OrderMe is a multi-vendor e-commerce platform designed to connect customers with sellers and provide an integrated ordering and delivery experience.

This repository contains the React frontend of OrderMe. The frontend communicates with a separate Laravel REST API backend for authentication, products, sellers, orders, payments, delivery management, and other system operations.

---

Project Overview

OrderMe is designed as a marketplace where:

- Customers can browse and purchase products from different sellers.
- Sellers can manage their stores, products, stock, and orders.
- Administrators can manage users, sellers, products, orders, and riders.
- Riders can receive delivery assignments and manage deliveries.
- A single customer order can contain products from multiple sellers.
- Delivery can be divided into multiple delivery groups depending on seller locations.
- Customers can track the progress of their orders.
- Delivery confirmation will use OTP verification.

---

Technology Stack

Frontend

- React.js
- Vite
- React Router
- Bootstrap
- Lucide React
- JavaScript (ES6+)
- Fetch API

Backend

The frontend communicates with a separate Laravel REST API.

- Laravel
- PHP
- Laravel Sanctum
- Spatie Laravel Permission
- MySQL / PostgreSQL

Development & Testing

- Visual Studio Code
- XAMPP
- Postman
- Git
- GitHub

---

System Architecture

                    ORDERME
                       |
              React Frontend
                       |
                 REST API
                       |
              Laravel Backend
                       |
                  Database
                       |
        MySQL / PostgreSQL

The frontend and backend are maintained separately.

React Frontend
      |
      | HTTP Requests
      ↓
Laravel REST API
      |
      ↓
Database

---

Main User Roles

OrderMe supports four main roles:

Buyer

Buyers can:

- Register and log in
- Browse products
- Browse categories
- Search for products
- Add products to cart
- Manage wishlist
- Place orders
- Make payments
- View order history
- Track deliveries
- Confirm delivery using OTP
- Review purchased products

Seller

Sellers can:

- Register as sellers
- Create a seller profile
- Manage store information
- Add products
- Upload product images
- Manage prices
- Manage discounts
- Manage stock
- View customer orders
- Update order processing status
- Prepare orders for delivery

Admin

Administrators can:

- Manage users
- Manage sellers
- Approve or reject sellers
- Manage categories
- Manage products
- Manage orders
- Manage riders
- Assign deliveries
- Monitor delivery operations

Rider

Riders can:

- Activate their account through an invitation
- Log in
- View assigned deliveries
- Accept delivery assignments
- Manage delivery progress
- Share their current location
- Confirm delivery using customer OTP

---

Frontend Structure

The frontend is organized around public pages and role-specific dashboards.

src/
│
├── assets/
│   └── images/
│
├── components/
│   ├── Navbar.jsx
│   ├── Footer.jsx
│   ├── ProductCard.jsx
│   └── ...
│
├── components_styles/
│   └── ...
│
├── layouts/
│   ├── MainLayout.jsx
│   ├── BuyerLayout.jsx
│   └── SellerLayout.jsx
│
├── pages/
│   ├── Home/
│   ├── auth/
│   ├── buyer/
│   ├── seller/
│   ├── admin/
│   └── rider/
│
├── routes/
│   └── AppRoutes.jsx
│
└── ...

---

Public Website

The public OrderMe website includes:

- Home
- Categories
- Deals
- New Arrivals
- Stores
- Login
- Registration

The homepage contains sections such as:

- Hero section
- Product categories
- Featured products
- Deals
- Top sellers
- Shopping benefits
- Footer

---

Navigation

The main navigation includes:

OrderMe
│
├── Categories
├── Deals
├── New Arrivals
├── Stores
├── Become a Seller
├── Search
├── Account
└── Cart

Categories are retrieved from the Laravel API rather than being permanently hardcoded in the frontend.

---

Authentication

Authentication is handled through the Laravel API using Laravel Sanctum.

The frontend communicates with endpoints such as:

POST /api/register
POST /api/login
POST /api/logout
POST /api/logout-all
GET  /api/me

After login, the frontend determines the user's role and redirects them to the appropriate dashboard.

Login
  ↓
Laravel API
  ↓
Authentication
  ↓
User + Role
  ↓
React Router
  ↓
Dashboard

---

Role-Based Routing

The application uses protected routes to prevent unauthorized access.

Buyer
  ↓
Buyer Dashboard

Seller
  ↓
Seller Dashboard

Admin
  ↓
Admin Dashboard

Rider
  ↓
Rider Dashboard

Users cannot access another role's dashboard simply by entering its URL.

Authorization is also enforced by the Laravel backend.

---

Buyer Dashboard

The Buyer dashboard provides:

Dashboard
Products
Categories
Cart
Orders
Wishlist
Settings
Logout

The buyer can manage their shopping activities from one interface.

---

Seller Dashboard

The Seller dashboard provides:

Dashboard
Orders
Products
Store Profile
Earnings
Settings
Logout

Seller product management includes:

- Product name
- Description
- Category
- Price
- Discount
- Stock quantity
- Product image
- Active/inactive status

Products are retrieved from and stored through the Laravel API.

---

Admin Dashboard

The Admin interface provides management functionality for:

- Users
- Sellers
- Categories
- Products
- Orders
- Riders
- Deliveries

The Admin role is responsible for controlling platform-level operations.

---

Rider Activation

Riders are not publicly registered.

Instead, an administrator creates the rider account and the rider receives an invitation email.

Admin
  ↓
Create Rider
  ↓
Invitation Email
  ↓
Rider Activation Page
  ↓
Create Password
  ↓
Account Activated
  ↓
Rider Login

The frontend activation page is:

/rider/activate

The invitation token is passed to the Laravel API for validation.

---

API Integration

The frontend uses an environment variable to communicate with Laravel.





The frontend then accesses the API using:

const API_URL = import.meta.env.VITE_API_URL;

---

Example API Request

const response = await fetch(`${API_URL}/categories`, {
    headers: {
        Accept: "application/json",
    },
});

const data = await response.json();

This keeps the frontend independent from the backend implementation.

---

Multi-Seller Order Architecture

OrderMe is designed to support multiple sellers in one customer order.

Example:

Order #1024
│
├── Seller A
│   ├── Product 1
│   └── Product 2
│
├── Seller B
│   └── Product 3
│
└── Seller C
    └── Product 4

The customer sees one main order while the backend manages individual seller orders.

---

Delivery Architecture

The planned delivery workflow is:

Seller Order
      ↓
Ready for Delivery
      ↓
Delivery Assignment
      ↓
Rider
      ↓
Pickup
      ↓
Out for Delivery
      ↓
Customer
      ↓
OTP Verification
      ↓
Delivered

If sellers are geographically separated, one customer order may be divided into multiple deliveries.



Responsive Design

The frontend is designed to support:

- Desktop
- Laptop
- Tablet
- Mobile

Bootstrap is used as the primary responsive UI framework.

---

UI Design

The OrderMe interface follows a professional e-commerce design with:

- Bootstrap components
- Golden/yellow OrderMe accent
- Dark/grey navigation
- Responsive layouts
- Reusable product cards
- Lucide icons
- Role-specific dashboards

---


Backend Repository

The React frontend requires the separate Laravel OrderMe backend to provide API functionality.

OrderMe Frontend
       │
       ↓
OrderMe Laravel API
       │
       ↓
Database

Make sure the Laravel backend is running before testing features that require API communication.

---

Testing

API endpoints are tested using Postman.

Frontend functionality is tested through:

- Browser testing
- API integration testing
- Role-based access testing
- Responsive testing
- End-to-end testing

---

Project Goal

The goal of OrderMe is to provide a scalable multi-vendor commerce platform where customers can purchase products from different sellers through a single marketplace while sellers, administrators, and delivery riders each have dedicated interfaces.

The system combines:

E-commerce + Multi-vendor Marketplace + Payments + Delivery Management + Rider Tracking

into one platform.

---

Development

OrderMe is currently under active development.

The frontend and backend are being developed independently while communicating through REST APIs.
