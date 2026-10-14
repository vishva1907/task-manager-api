[![CI Pipeline](https://github.com/vishva1907/task-manager-api/actions/workflows/ci.yml/badge.svg)](https://github.com/vishva1907/task-manager-api/actions/workflows/ci.yml)

# Task Manager API

A RESTful Task Management API built using Node.js, Express.js, MongoDB, Mongoose, JWT authentication, bcrypt password hashing, middleware, and server-side in-memory caching.

## Technologies Used

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcryptjs
- CORS
- dotenv
- node-cache

## Features

- User registration and login
- Password hashing using bcrypt
- JWT authentication
- Protected API routes
- Create, read, update and delete tasks
- Request logging middleware
- Task validation middleware
- Global error handling
- Server-side in-memory caching
- Cache hit/miss statistics
- Cache invalidation
- Response-time comparison

---

# API Endpoints

## Authentication

### Register

```http
POST /register
