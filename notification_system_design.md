# Notification System Design

## Stage 1 — REST API Design

### Endpoints

#### GET /notifications
- Description: List all notifications, paginated.
- Headers:
  - Authorization: Bearer <token>
  - Accept: application/json
- Query Parameters:
  - page (integer, optional, default: 1)
  - limit (integer, optional, default: 20)
  - student_id (UUID, optional)
  - is_read (boolean, optional)
- Response Body:
  {
    "page": 1,
    "limit": 20,
    "total": 184,
    "notifications": [
      {
        "id": "uuid",
        "student_id": "uuid",
        "type": "Placement",
        "message": "Your placement interview is scheduled.",
        "is_read": false,
        "created_at": "2026-06-10T12:00:00Z"
      }
    ]
  }
- Status Codes:
  - 200 OK
  - 401 Unauthorized
  - 403 Forbidden
  - 500 Internal Server Error

#### GET /notifications/:id
- Description: Retrieve a single notification by ID.
- Headers:
  - Authorization: Bearer <token>
  - Accept: application/json
- Response Body:
  {
    "id": "uuid",
    "student_id": "uuid",
    "type": "Event",
    "message": "Hackathon registration open.",
    "is_read": false,
    "created_at": "2026-06-10T08:00:00Z"
  }
- Status Codes:
  - 200 OK
  - 401 Unauthorized
  - 403 Forbidden
  - 404 Not Found
  - 500 Internal Server Error

#### POST /notifications
- Description: Create a new notification for a student.
- Headers:
  - Authorization: Bearer <token>
  - Content-Type: application/json
- Request Body:
  {
    "student_id": "uuid",
    "type": "Placement",
    "message": "Your placement offer has arrived."
  }
- Response Body:
  {
    "id": "uuid",
    "student_id": "uuid",
    "type": "Placement",
    "message": "Your placement offer has arrived.",
    "is_read": false,
    "created_at": "2026-06-10T12:00:00Z"
  }
- Status Codes:
  - 201 Created
  - 400 Bad Request
  - 401 Unauthorized
  - 403 Forbidden
  - 500 Internal Server Error

#### PATCH /notifications/:id/read
- Description: Mark a notification as read.
- Headers:
  - Authorization: Bearer <token>
  - Content-Type: application/json
- Request Body: none
- Response Body:
  {
    "id": "uuid",
    "student_id": "uuid",
    "type": "Result",
    "message": "Your exam results are published.",
    "is_read": true,
    "created_at": "2026-06-10T09:00:00Z"
  }
- Status Codes:
  - 200 OK
  - 400 Bad Request
  - 401 Unauthorized
  - 403 Forbidden
  - 404 Not Found
  - 500 Internal Server Error

#### DELETE /notifications/:id
- Description: Delete a notification.
- Headers:
  - Authorization: Bearer <token>
  - Accept: application/json
- Response Body:
  {
    "message": "Notification deleted successfully."
  }
- Status Codes:
  - 200 OK
  - 401 Unauthorized
  - 403 Forbidden
  - 404 Not Found
  - 500 Internal Server Error

### Notification Types
- Placement
- Event
- Result

## Stage 2 — DB Schema + REST APIs

### Chosen Database
- PostgreSQL: relational, transactional, good for structured student/notification data.

### Schema

```sql
CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  type VARCHAR(50) CHECK (type IN ('Placement', 'Event', 'Result')),
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Scale considerations
- Index student_id and created_at for fast per-student retrieval.
- Archive or partition old notifications by created_at to keep the active table small.
- Use warm/hot tables for recent notifications and cold storage for notifications older than 90 days.
- Consider daily batch jobs to move stale rows into an archive table or data warehouse.

## Stage 3 — Query Optimization

### Slow query

```sql
SELECT * FROM notifications
WHERE studentID = 1042 AND isRead = false
ORDER BY createdAt DESC;
```

### Optimized query

```sql
SELECT id, type, message, created_at
FROM notifications
WHERE student_id = $1 AND is_read = false
ORDER BY created_at DESC
LIMIT 20;
```

### Index to add

```sql
CREATE INDEX idx_notifications_student_unread
ON notifications(student_id, is_read, created_at DESC)
WHERE is_read = false;
```

### Why not index every column?
- Indexes improve read query performance, but each index slows writes.
- Multi-column and partial indexes are more efficient than indexing every field.
- Too many indexes increase storage, maintenance, and vacuum overhead.
- Write-heavy workloads suffer from index bloat and longer insert/update/delete times.

### Placement notifications last 7 days

```sql
SELECT DISTINCT student_id FROM notifications
WHERE type = 'Placement'
  AND created_at >= NOW() - INTERVAL '7 days';
```

## Stage 4 — Caching Strategy

### Redis per-student cache
- Cache the latest notifications per authenticated student.
- Use a short TTL (30–60 seconds) to balance freshness and load reduction.
- Invalidate or update cache when a new notification is created or marked read.
- Best tradeoff for a personalized feed.

### Why CDN/Edge caching is not suitable
- Notifications are personalized and vary per student.
- CDN caching is ideal for public static resources, not user-specific data.

### Why in-memory server cache does not scale
- In-memory cache is local to one server instance.
- Horizontal scaling requires a distributed cache like Redis.
- Local cache can lead to stale or inconsistent views across nodes.

### Tradeoffs
- Staleness vs DB load: higher TTL reduces reads but increases chance of stale notifications.
- Invalidating on new content is essential for correctness.
- Cache population should happen on read and on write operations.

## Stage 5 — Bulk Notify Redesign

### Problem with synchronous loop
- Sending notifications to 50,000 students synchronously blocks the event loop.
- A single failure can stop the entire process.
- There is no retry or backoff logic.

### Revised design
- Use a message queue (e.g. BullMQ with Redis).
- Enqueue individual notification tasks.
- Run workers independently with retry and failure handling.
- Keep email delivery and DB inserts decoupled.

### Example pseudocode

```ts
async function notify_all(student_ids: string[], message: string) {
  const jobs = student_ids.map(id => ({ data: { student_id: id, message } }));
  await notificationQueue.addBulk(jobs);
}

worker.process(async (job) => {
  await Promise.allSettled([
    send_email(job.data.student_id, job.data.message),
    save_to_db(job.data.student_id, job.data.message),
    push_to_app(job.data.student_id, job.data.message),
  ]);
});
```

### Reliability notes
- Use idempotent job processing so retries do not create duplicates.
- Use the outbox pattern if you need eventual consistency between DB writes and external systems.
- Email failure should not roll back the notification save.
- Track job failures and retry with exponential backoff.

## Stage 6 — Priority Inbox

### Priority score formula
- TYPE_WEIGHT = { Placement: 3, Result: 2, Event: 1 }
- score = type_weight * 0.7 + recency_score * 0.3
- recency_score = 1 / (1 + age_hours)

### Bucketed approach
- Fetch notifications from `GET /evaluation-service/notifications`.
- Compute scores on the server.
- Return the top 10 notifications sorted by score.

### Main algorithm
- Use a max-heap or a bounded min-heap to extract the top N notifications in O(n log k).
- Keep the heap size to 10 while scanning all results.
- This avoids sorting the full notification set in memory.
