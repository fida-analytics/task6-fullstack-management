
const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8080";

export async function getTasks(options = {}) {
  const params = new URLSearchParams();

  Object.entries(options).forEach(([key, value]) => {
    if (value !== "" && value !== undefined && value !== null) {
      params.set(key, String(value));
    }
  });

  const query = params.toString();
  const response = await fetch(
    `${API_URL}/api/tasks${query ? `?${query}` : ""}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch tasks.");
  }

  return response.json();
}

export async function getCategories() {
  const response = await fetch(`${API_URL}/api/categories`);

  if (!response.ok) {
    throw new Error("Failed to fetch categories.");
  }

  return response.json();
}

export async function addTask(task) {
  const response = await fetch(`${API_URL}/api/tasks`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(task),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to add task.");
  }

  return data;
}

export async function updateTask(id, updates) {
  const response = await fetch(`${API_URL}/api/tasks/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updates),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to update task.");
  }

  return data;
}

export async function deleteTask(id) {
  const response = await fetch(`${API_URL}/api/tasks/${id}`, {
    method: "DELETE",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to delete task.");
  }

  return data;
}
