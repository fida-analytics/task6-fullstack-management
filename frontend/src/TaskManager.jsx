
import { useCallback, useEffect, useState } from "react";
import {
  createTask,
  deleteTask,
  getTasks,
  updateTask,
} from "./api";
import "./App.css";

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadTasks = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getTasks();
      setTasks(data.tasks);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  async function handleAdd(event) {
    event.preventDefault();

    if (!title.trim()) {
      setError("Task ka naam likhna zaroori hai.");
      return;
    }

    setSaving(true);
    setError("");
    setNotice("");

    try {
      await createTask(title.trim());
      setTitle("");
      setNotice("Task successfully add ho gaya!");
      await loadTasks();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleToggle(task) {
    setError("");
    setNotice("");

    try {
      await updateTask(task.id, {
        completed: !task.completed,
      });
      await loadTasks();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleSaveEdit(id) {
    if (!editingTitle.trim()) {
      setError("Task ka naam khaali nahi ho sakta.");
      return;
    }

    setError("");
    setNotice("");

    try {
      await updateTask(id, {
        title: editingTitle.trim(),
      });
      setEditingId(null);
      setEditingTitle("");
      setNotice("Task update ho gaya!");
      await loadTasks();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(id) {
    const confirmed = window.confirm(
      "Kya tum waqai yeh task delete karna chahte ho?"
    );

    if (!confirmed) return;

    setError("");
    setNotice("");

    try {
      await deleteTask(id);
      setNotice("Task delete ho gaya!");
      await loadTasks();
    } catch (err) {
      setError(err.message);
    }
  }

  const completedCount = tasks.filter(
    (task) => task.completed
  ).length;

  return (
    <main className="app-shell">
      <section className="task-card">
        <header className="app-header">
          <div className="brand-icon">✓</div>
          <p className="eyebrow">MY WORKSPACE</p>
          <h1>Task Manager</h1>
          <p className="subtitle">
            Organize your day, one task at a time.
          </p>
        </header>

        <div className="stats">
          <div>
            <span>Total tasks</span>
            <strong>{tasks.length}</strong>
          </div>
          <div>
            <span>Completed</span>
            <strong>{completedCount}</strong>
          </div>
          <div>
            <span>Remaining</span>
            <strong>{tasks.length - completedCount}</strong>
          </div>
        </div>

        <form className="add-form" onSubmit={handleAdd}>
          <input
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="What needs to be done?"
            maxLength={200}
            aria-label="New task title"
          />
          <button type="submit" disabled={saving}>
            {saving ? "Adding..." : "+ Add"}
          </button>
        </form>

        {error && (
          <div className="message error" role="alert">
            {error}
          </div>
        )}

        {notice && (
          <div className="message success" role="status">
            {notice}
          </div>
        )}

        <div className="list-heading">
          <h2>Your tasks</h2>
          <button
            type="button"
            className="refresh-button"
            onClick={loadTasks}
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <p className="empty-state">Loading tasks...</p>
        ) : tasks.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">✦</span>
            <p>No tasks yet</p>
            <span>Add your first task above to get started.</span>
          </div>
        ) : (
          <ul className="task-list">
            {tasks.map((task) => (
              <li
                className={`task-item ${
                  task.completed ? "completed" : ""
                }`}
                key={task.id}
              >
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => handleToggle(task)}
                  aria-label={`Mark ${task.title} as completed`}
                />

                {editingId === task.id ? (
                  <div className="edit-area">
                    <input
                      value={editingTitle}
                      onChange={(event) =>
                        setEditingTitle(event.target.value)
                      }
                      maxLength={200}
                      aria-label="Edit task title"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => handleSaveEdit(task.id)}
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={() => setEditingId(null)}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <>
                    <span className="task-title">{task.title}</span>
                    <div className="task-actions">
                      <button
                        type="button"
                        className="edit-button"
                        onClick={() => {
                          setEditingId(task.id);
                          setEditingTitle(task.title);
                        }}
                        aria-label={`Edit ${task.title}`}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="delete-button"
                        onClick={() => handleDelete(task.id)}
                        aria-label={`Delete ${task.title}`}
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}

        <footer>
          Powered by React & your Task API
        </footer>
      </section>
    </main>
  );
}
