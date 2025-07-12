# 📚 NestJS Document Ingestion API

A modular, testable, and Dockerized backend built with **NestJS**, **Prisma ORM**, and **PostgreSQL**. It supports:

- ✅ JWT-based authentication with role management (admin, editor, viewer)  
- ✅ Document upload and retrieval  
- ✅ Ingestion workflows and status tracking  

---

## 🛠 Tech Stack

- **NestJS** – Progressive Node.js framework  
- **Prisma ORM** – Type-safe database access  
- **PostgreSQL** – Dockerized relational database  
- **Docker + Docker Compose** – Containerized development  

---

## 🚀 Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/jainsarthak216/JK-Tech-assignment
cd nestjs-backend
```

### 2. Set Up Environment Variables

Copy the example env and configure:

```bash
cp .env.example .env
```

Update `.env` with your own values:

```ini
DATABASE_URL=postgresql://nestuser:nestpass@postgres:5432/nestdb
JWT_SECRET=your_jwt_secret_key
```

### 3. Run with Docker Compose

```bash
docker-compose up --build
```

This will start:
- API on [http://localhost:3000](http://localhost:3000)
- PostgreSQL on localhost:5432

### 4. Apply Prisma Migrations

Run inside container:

```bash
docker-compose run --rm prisma migrate dev --name init
```

To generate the Prisma client (when schema changes):

```bash
docker-compose run --rm prisma generate
```

---

## 🔐 Authentication

Use the following routes:

- `POST /auth/register` – Register new user
- `POST /auth/login` – Login and receive JWT

Login returns a JWT token. Use it in headers for protected routes:

```
Authorization: Bearer <your_jwt_token>
```

Protect endpoints in code with:

```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
```

---

## 📄 API Endpoints

### Auth
- `POST /auth/register`
- `POST /auth/login`

### Users (Admin Only)
- `GET /users`
- `PATCH /users/:id/role`

### Documents
- `POST /documents/upload`
- `GET /documents`
- `GET /documents/:id`
- `GET /documents/:id/ingestion-status`

### Ingestion
- `POST /ingestion/trigger`
- `GET /ingestion/status/:id`

---

## 📁 Project Structure

```
src/
├── auth/         # Auth & JWT
├── documents/    # File/document handling
├── ingestion/    # Ingestion workflow logic
├── prisma/       # Prisma client & schema
└── users/        # User and role management
```

---

## 🧪 Running Tests

Run unit tests for services and controllers:

```bash
npm run test
```

---

## 🐘 Debugging Database

Access PostgreSQL CLI:

```bash
docker exec -it nestjs-backend-postgres-1 psql -U nestuser -d nestdb
```

View tables:

```sql
\dt
SELECT * FROM "User";
SELECT * FROM "Document";
```

Optionally, run Prisma Studio:

```bash
docker-compose run --rm prisma studio
```

---
