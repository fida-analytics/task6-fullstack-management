
const express = require("express");
const cors = require("cors");
const db = require("./database");

const app = express();
const PORT = process.env.PORT || 8080;

// Allow local development and deployed Task 5 / Task 6 frontends
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "https://task5-frontend-beryl.vercel.app",
  "https://task6-fullstack-management.vercel.app"
];

app.use(
  cors({
    origin: allowedOrigins
  })
);

app.use(express.json());

const allowedSortFields = {
  id: "t.id",
  title: "t.title",
  created_at: "t.created_at",
  updated_at: "t.updated_at",
  priority: "t.priority"
};

app.get("/", (req, res) => {
  res.json({ message: "Task Management API is running." });
});

app.get("/api/tasks", (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(
    100,
    Math.max(1, parseInt(req.query.limit, 10) || 10)
  );
  const offset = (page - 1) * limit;

  const search = String(req.query.search || "").trim();
  const completed = req.query.completed;
  const categoryId = req.query.category_id;
  const priority = req.query.priority;

  const sortBy = allowedSortFields[req.query.sort_by] || "t.id";
  const order =
    String(req.query.order || "").toLowerCase() === "asc"
      ? "ASC"
      : "DESC";

  const conditions = [];
  const params = [];

  if (search) {
    conditions.push("t.title LIKE ?");
    params.push(`%${search}%`);
  }

  if (completed === "true" || completed === "false") {
    conditions.push("t.completed = ?");
    params.push(completed === "true" ? 1 : 0);
  }

  if (categoryId !== undefined) {
    const id = Number(categoryId);

    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({ error: "Invalid category_id." });
    }

    conditions.push("t.category_id = ?");
    params.push(id);
  }

  if (priority !== undefined) {
    if (!["low", "medium", "high"].includes(priority)) {
      return res.status(400).json({
        error: "Priority must be low, medium, or high."
      });
    }

    conditions.push("t.priority = ?");
    params.push(priority);
  }

  const where = conditions.length
    ? `WHERE ${conditions.join(" AND ")}`
    : "";

  db.get(
    `SELECT COUNT(*) AS total
     FROM tasks t
     ${where}`,
    params,
    (countErr, countRow) => {
      if (countErr) {
        return res.status(500).json({ error: countErr.message });
      }

      db.all(
        `SELECT
           t.id,
           t.title,
           t.completed,
           t.category_id,
           c.name AS category,
           t.priority,
           t.created_at,
           t.updated_at
         FROM tasks t
         LEFT JOIN categories c ON c.id = t.category_id
         ${where}
         ORDER BY ${sortBy} ${order}
         LIMIT ? OFFSET ?`,
        [...params, limit, offset],
        (err, tasks) => {
          if (err) {
            return res.status(500).json({ error: err.message });
          }

          res.json({
            page,
            limit,
            total: countRow.total,
            totalPages: Math.ceil(countRow.total / limit),
            tasks: tasks.map((task) => ({
              ...task,
              completed: Boolean(task.completed)
            }))
          });
        }
      );
    }
  );
});

app.get("/api/categories", (req, res) => {
  db.all(
    "SELECT id, name FROM categories ORDER BY name ASC",
    [],
    (err, categories) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      res.json({ categories });
    }
  );
});

app.post("/api/tasks", (req, res) => {
  const {
    title,
    category_id = 1,
    priority = "medium"
  } = req.body;

  if (typeof title !== "string" || !title.trim()) {
    return res.status(400).json({ error: "Task title is required." });
  }

  if (title.trim().length > 200) {
    return res.status(400).json({
      error: "Task title must be 200 characters or fewer."
    });
  }

  const categoryId = Number(category_id);

  if (!Number.isInteger(categoryId) || categoryId < 1) {
    return res.status(400).json({ error: "Invalid category_id." });
  }

  if (!["low", "medium", "high"].includes(priority)) {
    return res.status(400).json({
      error: "Priority must be low, medium, or high."
    });
  }

  db.get(
    "SELECT id FROM categories WHERE id = ?",
    [categoryId],
    (categoryErr, category) => {
      if (categoryErr) {
        return res.status(500).json({ error: categoryErr.message });
      }

      if (!category) {
        return res.status(400).json({ error: "Category does not exist." });
      }

      db.run(
        `INSERT INTO tasks
         (title, completed, category_id, priority, created_at, updated_at)
         VALUES (?, 0, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        [title.trim(), categoryId, priority],
        function (err) {
          if (err) {
            return res.status(500).json({ error: err.message });
          }

          db.get(
            `SELECT
               t.id,
               t.title,
               t.completed,
               t.category_id,
               c.name AS category,
               t.priority,
               t.created_at,
               t.updated_at
             FROM tasks t
             LEFT JOIN categories c ON c.id = t.category_id
             WHERE t.id = ?`,
            [this.lastID],
            (selectErr, task) => {
              if (selectErr) {
                return res.status(500).json({
                  error: selectErr.message
                });
              }

              res.status(201).json({
                task: {
                  ...task,
                  completed: Boolean(task.completed)
                }
              });
            }
          );
        }
      );
    }
  );
});

app.put("/api/tasks/:id", (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id < 1) {
    return res.status(400).json({ error: "Invalid task ID." });
  }

  const { title, completed, category_id, priority } = req.body;
  const fields = [];
  const params = [];

  if (title !== undefined) {
    if (
      typeof title !== "string" ||
      !title.trim() ||
      title.trim().length > 200
    ) {
      return res.status(400).json({
        error: "Title must be 1–200 characters."
      });
    }

    fields.push("title = ?");
    params.push(title.trim());
  }

  if (completed !== undefined) {
    if (typeof completed !== "boolean") {
      return res.status(400).json({
        error: "Completed must be true or false."
      });
    }

    fields.push("completed = ?");
    params.push(completed ? 1 : 0);
  }

  if (category_id !== undefined) {
    const categoryId = Number(category_id);

    if (!Number.isInteger(categoryId) || categoryId < 1) {
      return res.status(400).json({ error: "Invalid category_id." });
    }

    fields.push("category_id = ?");
    params.push(categoryId);
  }

  if (priority !== undefined) {
    if (!["low", "medium", "high"].includes(priority)) {
      return res.status(400).json({
        error: "Priority must be low, medium, or high."
      });
    }

    fields.push("priority = ?");
    params.push(priority);
  }

  if (fields.length === 0) {
    return res.status(400).json({ error: "No valid fields provided." });
  }

  fields.push("updated_at = CURRENT_TIMESTAMP");
  params.push(id);

  db.run(
    `UPDATE tasks SET ${fields.join(", ")} WHERE id = ?`,
    params,
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: "Task not found." });
      }

      db.get(
        `SELECT
           t.id,
           t.title,
           t.completed,
           t.category_id,
           c.name AS category,
           t.priority,
           t.created_at,
           t.updated_at
         FROM tasks t
         LEFT JOIN categories c ON c.id = t.category_id
         WHERE t.id = ?`,
        [id],
        (selectErr, task) => {
          if (selectErr) {
            return res.status(500).json({
              error: selectErr.message
            });
          }

          res.json({
            task: {
              ...task,
              completed: Boolean(task.completed)
            }
          });
        }
      );
    }
  );
});

app.delete("/api/tasks/:id", (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id < 1) {
    return res.status(400).json({ error: "Invalid task ID." });
  }

  db.run(
    "DELETE FROM tasks WHERE id = ?",
    [id],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: "Task not found." });
      }

      res.json({ message: "Task deleted successfully." });
    }
  );
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
