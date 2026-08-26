# SportShop E-Commerce Platform

A full-stack, comprehensive e-commerce platform built specifically for sporting goods. This project features a robust back-end powered by Django REST Framework and a blazing-fast, modern front-end built with React and Vite. 

> Support for local Nepalese payment gateways like **eSewa** and **Khalti** is built right into the platform!

---

## Tech Stack

### Backend
- **Python & Django** - Core backend framework
- **Django REST Framework (DRF)** - For building robust APIs
- **SQLite Tracker** - Default local database

### Frontend
- **React 19** - UI Library
- **Vite 8** - Lightning fast build tool & dev server
- **React Router DOM** - Client-side routing
- **Oxlint** - Linter for ultra-fast code checking

---

## Features

- **Products & Categories**: Browse through a rich catalog of products and categories.
- **Shopping Cart**: Fully functional cart management system.
- **Coupons & Discounts**: Apply promotional coupon logic during checkout.
- **Payment Integration**: Support for payment gateways (eSewa & Khalti).
- **Order Management**: Placed orders, tracking, and cancellation capabilities.
- **User Management**: Built-in authentication (login, registration, password reset).

---

## Local Development Setup

### Prerequisites
- Python 3.10+
- Node.js 18+ & npm/yarn

### 1. Setting up the Backend
```bash
# Navigate to the backend directory
cd backend

# Create and activate a virtual environment
python -m venv venv
source venv/bin/activate  # On Windows use: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run database migrations
python manage.py migrate

# Start the Django development server
python manage.py runserver
```

### 2. Setting up the Frontend
```bash
# Navigate to the frontend directory
cd frontend

# Install Node dependencies
npm install

# Start the Vite development server
npm run dev
```

---

## Project Structure
```text
sport-ecommerce/
├── backend/            # Django application
│   ├── cart/           # Cart management logic
│   ├── coupons/        # Discount & promotional codes
│   ├── ecommerce_project/# Core Django settings
│   ├── orders/         # Checkout and order tracking
│   ├── payments/       # eSewa and Khalti integrations
│   ├── products/       # Product catalog models and views
│   └── users/          # Authentication & user profiles
│
└── frontend/           # React frontend
    ├── public/         # Static assets
    └── src/            # React components & pages
```

## Next Steps / Roadmap
To see the upcoming tasks and known gaps for this project, check out `deep_analysis.md` located in the root of the project.
