# 📚 NestJS Document Ingestion API

A backend service built using **NestJS**, **Prisma**, and **PostgreSQL**, supporting:

- JWT-based authentication and role-based access
- Document upload and ingestion tracking
- Prisma ORM for database access
- Dockerized local development

---

## 🛠 Tech Stack

- **NestJS** – Node.js framework  
- **Prisma** – ORM for PostgreSQL  
- **PostgreSQL** – Database  
- **Docker & Docker Compose** – Containerized setup

---

## 🚀 Getting Started (Local Setup)

### 1. Clone the Repository

```bash
git clone https://github.com/jainsarthak216/JK-Tech-assignment
cd nestjs-backend
````

---

### 2. Set Up Environment Variables

Copy the example file:

```bash
cp .env.example .env
```

Update `.env` with:

```ini
DATABASE_URL=postgresql://nestuser:nestpass@postgres:5432/nestdb
JWT_SECRET=your_jwt_secret_key
```

---

### 3. Start the Application

Run the containers:

```bash
docker-compose up --build
```

The services will start on:

* API → [http://localhost:3000](http://localhost:3000)
* PostgreSQL → port 5432

---

### 4. Migrate Database & Generate Prisma Client

Apply database schema:

```bash
docker-compose run --rm prisma migrate dev --name init
```

(Optional) Re-generate Prisma client after schema changes:

```bash
docker-compose run --rm prisma generate
```

---

## 🔐 Authentication

### Register

```http
POST /auth/register
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "strongpass",
  "role": "admin"
}
```

### Login

```http
POST /auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "strongpass"
}
```

Returns:

```json
{
  "access_token": "JWT_TOKEN"
}
```

Use the token in headers for protected routes:

```
Authorization: Bearer JWT_TOKEN
```

---

## 📄 API Endpoints

### Auth

* `POST /auth/register`
* `POST /auth/login`

### Users (Admin)

* `GET /users`
* `PATCH /users/:id/role`

### Documents

* `POST /documents/upload` (multipart/form-data)
* `GET /documents`
* `GET /documents/:id`
* `GET /documents/:id/ingestion-status`

### Ingestion

* `POST /ingestion/trigger`
* `GET /ingestion/status/:id`

---

## 🧪 Testing

Run all unit tests:

```bash
npm run test
```

---

## 🐘 Accessing the Database

Enter PostgreSQL shell:

```bash
docker exec -it nestjs-backend-postgres-1 psql -U nestuser -d nestdb
```

View tables or query data:

```sql
\dt
SELECT * FROM "User";
SELECT * FROM "Document";
SELECT * FROM "Ingestion";
```

(Optional) Visual DB browser:

```bash
docker-compose run --rm prisma studio
```

Open: [http://localhost:5555](http://localhost:5555)

---

## 📁 Project Structure

```
src/
├── auth/         # JWT & login logic
├── documents/    # Upload + ingestion
├── ingestion/    # Ingestion workflow
├── prisma/       # Prisma schema & client
├── users/        # User & role logic
└── main.ts       # App entrypoint
```

---
