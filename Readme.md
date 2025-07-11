# NestJS Document Management Backend

This project is a modular, testable, and Dockerized NestJS backend for user authentication, document upload, and ingestion tracking.

## 📦 Features
- JWT Authentication with roles (admin, editor, viewer)
- Upload and manage documents
- Trigger and track ingestion processes
- Unit-tested services and controllers
- Dockerized with PostgreSQL

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd nestjs-backend
```

### 2. Create a `.env` file
```bash
cp .env.example .env
```

### 3. Build and run using Docker Compose
```bash
docker-compose up --build
```

App will be available at: `http://localhost:3000`

## 🔐 Authentication
Use `/auth/register` and `/auth/login` to get JWT tokens. Include the token in headers:
```http
Authorization: Bearer <token>
```

## 📄 Example Endpoints
- `POST /documents/upload`
- `GET /documents`
- `GET /documents/:id`
- `GET /documents/:id/ingestion-status`
- `POST /ingestion/trigger`
- `GET /ingestion/status/:id`

## 🧪 Running Tests
```bash
npm run test
```

## 🐳 Docker Services
- **backend**: NestJS API
- **postgres**: PostgreSQL database

## 📁 Folder Structure
```
src/
 ├── auth/
 ├── documents/
 └── ingestion/
```

## ✅ TODOs
- CI/CD pipeline
- Role-based document access control

---