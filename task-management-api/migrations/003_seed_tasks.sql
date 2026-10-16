
INSERT INTO tasks (
    title,
    completed,
    category_id,
    priority,
    created_at,
    updated_at
)
SELECT
    'Complete project documentation',
    0,
    2,
    'high',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
WHERE NOT EXISTS (
    SELECT 1 FROM tasks
    WHERE title = 'Complete project documentation'
);

INSERT INTO tasks (
    title,
    completed,
    category_id,
    priority,
    created_at,
    updated_at
)
SELECT
    'Review database relationships',
    0,
    3,
    'medium',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
WHERE NOT EXISTS (
    SELECT 1 FROM tasks
    WHERE title = 'Review database relationships'
);

INSERT INTO tasks (
    title,
    completed,
    category_id,
    priority,
    created_at,
    updated_at
)
SELECT
    'Prepare final submission',
    1,
    4,
    'low',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
WHERE NOT EXISTS (
    SELECT 1 FROM tasks
    WHERE title = 'Prepare final submission'
);
