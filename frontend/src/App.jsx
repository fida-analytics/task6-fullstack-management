
import { useCallback, useEffect, useState } from "react";
import {
  getTasks,
  getCategories,
  addTask,
  updateTask,
  deleteTask,
} from "./api";
import "./App.css";

function App() {
  const [tasks, setTasks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState("1");
  const [priority, setPriority] = useState("medium");
  const [search, setSearch] = useState("");
  const [completed, setCompleted] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const [sortBy, setSortBy] = useState("id");
  const [order, setOrder] = useState("desc");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadTasks = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const result = await getTasks({
        page,
        limit,
        search,
        completed,
        category_id: filterCategory,
        priority: filterPriority,
        sort_by: sortBy,
        order,
      });

      setTasks(result.tasks || []);
      setTotalPages(Math.max(1, result.totalPages || 1));
      setTotal(result.total || 0);
    } catch (err) {
      setError(err.message || "Tasks load nahi ho sake.");
    } finally {
      setLoading(false);
    }
  }, [
    page,
    limit,
    search,
    completed,
    filterCategory,
    filterPriority,
    sortBy,
    order,
  ]);

  const loadCategories = useCallback(async () => {
    try {
      const result = await getCategories();
      setCategories(result.categories || []);

      if (result.categories?.length) {
        setCategoryId(String(result.categories[0].id));
      }
    } catch (err) {
      setError(err.message || "Categories load nahi ho sakin.");
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  async function handleAddTask(event) {
    event.preventDefault();
    setError("");
    setNotice("");

    if (!title.trim()) {
      setError("Task title zaroor likhein.");
      return;
    }

    if (title.trim().length > 200) {
      setError("Title 200 characters se zyada nahi ho sakta.");
      return;
    }

    try {
      await addTask({
        title: title.trim(),
        category_id: Number(categoryId),
        priority,
      });

      setTitle("");
      setPage(1);
      setNotice("Task successfully add ho gaya.");
      await loadTasks();
    } catch (err) {
      setError(err.message || "Task add nahi ho saka.");
    }
  }

  async function handleToggle(task) {
    setError("");
    setNotice("");

    try {
      await updateTask(task.id, {
        completed: !task.completed,
      });
      setNotice("Task status update ho gaya.");
      await loadTasks();
    } catch (err) {
      setError(err.message || "Task update nahi ho saka.");
    }
  }

  async function handlePriorityChange(task, newPriority) {
    try {
      await updateTask(task.id, { priority: newPriority });
      setNotice("Priority update ho gayi.");
      await loadTasks();
    } catch (err) {
      setError(err.message || "Priority update nahi hui.");
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Kya aap ye task delete karna chahte hain?")) {
      return;
    }

    try {
      await deleteTask(id);
      setNotice("Task delete ho gaya.");

      if (tasks.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        await loadTasks();
      }
    } catch (err) {
      setError(err.message || "Task delete nahi ho saka.");
    }
  }

  function resetFilters() {
    setSearch("");
    setCompleted("");
    setFilterCategory("");
    setFilterPriority("");
    setSortBy("id");
    setOrder("desc");
    setLimit(5);
    setPage(1);
  }

  return (
    <main className="app-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">FULL STACK DEVELOPMENT · TASK 6</p>
          <h1>Task Management</h1>
          <p className="subtitle">
            Organize your tasks with search, filters and database-powered tools.
          </p>
        </div>
        <div className="total-badge">
          <span>Total tasks</span>
          <strong>{total}</strong>
        </div>
      </header>

      {error && <div className="message error-message">{error}</div>}
      {notice && <div className="message success-message">{notice}</div>}

      <section className="panel">
        <h2>Create a task</h2>

        <form className="task-form" onSubmit={handleAddTask}>
          <label className="field title-field">
            Task title
            <input
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="What do you need to do?"
              maxLength={200}
              required
            />
          </label>

          <label className="field">
            Category
            <select
              value={categoryId}
              onChange={(event) => setCategoryId(event.target.value)}
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            Priority
            <select
              value={priority}
              onChange={(event) => setPriority(event.target.value)}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </label>

          <button className="primary-button add-button" type="submit">
            + Add task
          </button>
        </form>
      </section>

      <section className="panel">
        <div className="section-heading">
          <div>
            <h2>Find your tasks</h2>
            <p>Search, filter and sort database records.</p>
          </div>
          <button className="secondary-button" onClick={resetFilters}>
            Reset filters
          </button>
        </div>

        <div className="filters-grid">
          <label className="field">
            Search title
            <input
              type="search"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Search tasks..."
            />
          </label>

          <label className="field">
            Status
            <select
              value={completed}
              onChange={(event) => {
                setCompleted(event.target.value);
                setPage(1);
              }}
            >
              <option value="">All statuses</option>
              <option value="false">Pending</option>
              <option value="true">Completed</option>
            </select>
          </label>

          <label className="field">
            Category
            <select
              value={filterCategory}
              onChange={(event) => {
                setFilterCategory(event.target.value);
                setPage(1);
              }}
            >
              <option value="">All categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            Priority
            <select
              value={filterPriority}
              onChange={(event) => {
                setFilterPriority(event.target.value);
                setPage(1);
              }}
            >
              <option value="">All priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </label>

          <label className="field">
            Sort by
            <select
              value={sortBy}
              onChange={(event) => {
                setSortBy(event.target.value);
                setPage(1);
              }}
            >
              <option value="id">Task ID</option>
              <option value="title">Title</option>
              <option value="priority">Priority</option>
              <option value="created_at">Created date</option>
              <option value="updated_at">Updated date</option>
            </select>
          </label>

          <label className="field">
            Sort order
            <select
              value={order}
              onChange={(event) => {
                setOrder(event.target.value);
                setPage(1);
              }}
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </label>
        </div>
      </section>

      <section className="panel">
        <div className="section-heading task-list-heading">
          <div>
            <h2>Your tasks</h2>
            <p>{total} matching record(s)</p>
          </div>

          <label className="field page-size-field">
            Per page
            <select
              value={limit}
              onChange={(event) => {
                setLimit(Number(event.target.value));
                setPage(1);
              }}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </label>
        </div>

        {loading ? (
          <p className="empty-state">Loading tasks...</p>
        ) : tasks.length === 0 ? (
          <p className="empty-state">No tasks found. Try another search or add a task.</p>
        ) : (
          <div className="task-list">
            {tasks.map((task) => (
              <article
                className={`task-card ${task.completed ? "task-completed" : ""}`}
                key={task.id}
              >
                <button
                  className={`status-button ${task.completed ? "checked" : ""}`}
                  onClick={() => handleToggle(task)}
                  aria-label={task.completed ? "Mark pending" : "Mark completed"}
                  title="Change task status"
                >
                  {task.completed ? "✓" : ""}
                </button>

                <div className="task-content">
                  <h3>{task.title}</h3>
                  <div className="task-meta">
                    <span className="category-chip">
                      {task.category || "General"}
                    </span>
                    <span className={`priority-chip priority-${task.priority}`}>
                      {task.priority}
                    </span>
                    <span className="task-id">ID: {task.id}</span>
                  </div>
                  <p className="task-date">
                    Created: {task.created_at || "Not available"}
                  </p>
                </div>

                <div className="task-actions">
                  <label className="field priority-control">
                    Priority
                    <select
                      value={task.priority || "medium"}
                      onChange={(event) =>
                        handlePriorityChange(task, event.target.value)
                      }
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </label>

                  <button
                    className="delete-button"
                    onClick={() => handleDelete(task.id)}
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}

        <div className="pagination">
          <button
            className="secondary-button"
            disabled={page <= 1 || loading}
            onClick={() => setPage((current) => current - 1)}
          >
            ← Previous
          </button>

          <span>
            Page <strong>{page}</strong> of <strong>{totalPages}</strong>
          </span>

          <button
            className="secondary-button"
            disabled={page >= totalPages || loading}
            onClick={() => setPage((current) => current + 1)}
          >
            Next →
          </button>
        </div>
      </section>

      <footer className="app-footer">
        Task Management System · React · Express · SQLite
      </footer>
    </main>
  );
}

export default App;
