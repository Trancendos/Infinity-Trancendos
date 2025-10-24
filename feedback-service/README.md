# Feedback Service

This service is the central ingestion point for all user feedback related to the Trancendos ecosystem. It provides a simple API endpoint to receive feedback from various sources, such as in-app surveys, app store reviews, and support tickets.

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm

### Installation

1.  Navigate to the `feedback-service` directory:
    ```bash
    cd feedback-service
    ```
2.  Install the dependencies:
    ```bash
    npm install
    ```

### Running the Service

To start the server, run the following command:

```bash
npm start
```

The service will start on port 3001 by default.

### Running Tests

To run the automated tests, use the following command:

```bash
npm test
```

## API Documentation

### `POST /api/feedback`

This endpoint is used to submit new feedback.

**Request Body:**

| Field     | Type     | Required | Description                                                  |
| :-------- | :------- | :------- | :----------------------------------------------------------- |
| `source`  | `String` | Yes      | The source of the feedback (e.g., "App Store", "In-App Survey"). |
| `content` | `String` | Yes      | The main content of the feedback.                            |
| `rating`  | `Number` | No       | An optional numerical rating (e.g., 1-5).                    |
| `user_id` | `String` | No       | An optional identifier for the user.                         |

**Example Request:**

```json
{
  "source": "App Store",
  "content": "This app is great, but it could use a dark mode.",
  "rating": 4,
  "user_id": "user-abc-123"
}
```

**Success Response (201 Created):**

```json
{
  "message": "Feedback received successfully.",
  "feedback": {
    "source": "App Store",
    "content": "This app is great, but it could use a dark mode.",
    "rating": 4,
    "user_id": "user-abc-123",
    "receivedAt": "2023-10-27T10:00:00.000Z"
  }
}
```

**Error Response (400 Bad Request):**

If required fields are missing:

```json
{
  "error": "Missing required fields: source and content are required."
}
```
