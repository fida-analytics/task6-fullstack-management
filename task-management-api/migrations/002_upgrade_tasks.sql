
ALTER TABLE tasks ADD COLUMN category_id INTEGER NOT NULL DEFAULT 1
    REFERENCES categories(id);

ALTER TABLE tasks ADD COLUMN priority TEXT NOT NULL DEFAULT 'medium'
    CHECK (priority IN ('low', 'medium', 'high'));

ALTER TABLE tasks ADD COLUMN created_at TEXT;
ALTER TABLE tasks ADD COLUMN updated_at TEXT;

CREATE INDEX IF NOT EXISTS idx_tasks_category_id
ON tasks(category_id);

CREATE INDEX IF NOT EXISTS idx_tasks_completed
ON tasks(completed);

CREATE INDEX IF NOT EXISTS idx_tasks_created_at
ON tasks(created_at);
UPDATE tasks
SET created_at = CURRENT_TIMESTAMP
WHERE created_at IS NULL;

UPDATE tasks
SET updated_at = CURRENT_TIMESTAMP
WHERE updated_at IS NULL;