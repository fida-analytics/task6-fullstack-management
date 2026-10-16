# Task Management System — Task 6

## Project Overview

A full-stack Task Management System built with React, Vite, Node.js, Express, and SQLite. The application allows users to create, view, update, search, filter, sort, paginate, and delete tasks.

## Technologies Used

- **Frontend:** React, Vite, JavaScript, CSS
- **Backend:** Node.js, Express.js
- **Database:** SQLite
- **API:** REST API
- **Database Migrations:** SQL migration files with a migration tracking table

## Project Structure

```text
Full_stack_development/
├── frontend/
│   └── src/
│       ├── App.jsx
│       ├── App.css
│       └── api.js
├── task-management-api/
│   ├── migrations/
│   │   ├── 001_initial_schema.sql
│   │   ├── 002_upgrade_tasks.sql
│   │   └── 003_seed_tasks.sql
│   ├── database.js
│   ├── migrate.js
│   ├── server.js
│   └── package.json
└── README.md
```

## Features

- Create, read, update, and delete tasks.
- Organize tasks using categories.
- Set task priorities: low, medium, and high.
- Mark tasks as completed or pending.
- Search tasks by title.
- Filter by status, category, and priority.
- Sort by task ID, title, priority, creation date, or update date.
- Paginate results and choose the number of records per page.
- Validate task input on both the client and server.
- Use SQL migrations to manage database changes.
- Preserve existing task records during schema upgrades.
- Include sample seed data for testing.

## Database Schema

### Categories

| Column | Type | Description |
|---|---|---|
| id | INTEGER | Primary key |
| name | TEXT | Unique category name |

### Tasks

| Column | Type | Description |
|---|---|---|
| id | INTEGER | Primary key |
| title | TEXT | Task title |
| completed | INTEGER | Completion status |
| category_id | INTEGER | References categories.id |
| priority | TEXT | low, medium, or high |
| created_at | TEXT | Creation timestamp |
| updated_at | TEXT | Last update timestamp |

### Relationships

Each task belongs to a category through `tasks.category_id`, which references `categories.id`.

### Migration Tracking

The `schema_migrations` table records applied migration filenames and timestamps.

## API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/tasks` | List tasks with search, filtering, sorting, and pagination |
| POST | `/api/tasks` | Create a task |
| PUT | `/api/tasks/:id` | Update a task |
| DELETE | `/api/tasks/:id` | Delete a task |
| GET | `/api/categories` | List available categories |

### Query Parameters

The tasks endpoint supports:

- `page` — page number
- `limit` — records per page
- `search` — search by title
- `completed` — `true` or `false`
- `category_id` — filter by category
- `priority` — `low`, `medium`, or `high`
- `sort_by` — `id`, `title`, `priority`, `created_at`, or `updated_at`
- `order` — `asc` or `desc`

Example:

`http://localhost:8080/api/tasks?page=1&limit=5&priority=high&order=desc`

## Setup Instructions

### 1. Backend

Open a terminal in the backend directory:

```bash
cd task-management-api
npm install
npm run migrate
npm start
```

The API runs on `http://localhost:8080` by default.

### 2. Frontend

Open a separate terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the local URL displayed by Vite in your browser.

## Database Migrations

SQL migration files are stored in `task-management-api/migrations`.

Run `npm run migrate` to apply any pending migrations. Already-applied migrations are skipped.

## Testing Checklist

- [ ] Create a task with a valid title.
- [ ] Reject an empty task title.
- [ ] Update completion status and priority.
- [ ] Delete a task.
- [ ] Search by title.
- [ ] Filter by status, category, and priority.
- [ ] Verify sorting and pagination.
- [ ] Confirm category information appears with tasks.
- [ ] Restart the backend and verify that data persists.

## Deployment

- GitHub Repository: Add your repository URL here.
- Live Frontend: Add your deployed frontend URL here.
- Live Backend: Add your deployed backend URL here, if applicable.

## Conclusion

This project demonstrates full-stack development, REST API design, relational database relationships, SQL migrations, data validation, and database-driven search, filtering, sorting, and pagination.
