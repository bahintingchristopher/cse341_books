# Books and Authors API Specification - Version 2

## Global API Standards & Architecture

### Standard Error Response Schema
All endpoints returning error status codes (`400`, `404`, `409`, `500`) must adhere to a standardized JSON error format:

```json
{
  "statusCode": 400,
  "error": "Bad Request",
  "message": "Detailed description of the validation failure or conflict."
}
```

### Core System Rules
- **Custom Identifiers:** Custom string IDs (`b1`, `a1`) are user-facing primary keys. They are required upon creation and are **immutable** (cannot be modified via `PUT`).
- **Database Indexing:** Unique indexes must be applied to the `id` field in both `books` and `authors` MongoDB collections to prevent unindexed full-collection scans (`COLLSCAN`).
- **Security & Data Sanitization:** All incoming route parameters and JSON body fields must be cast and sanitized as explicit strings/numbers before query execution to prevent NoSQL injection. Internal server database error traces must be logged server-side and masked from public API responses.

---

## Feature 1: Book CRUD Operations and Author References

### Goal
Update the existing Week 01 book API so book documents reference an author by ID, enforce referential integrity against the `authors` collection, and support complete CRUD operations documented in Swagger.

### Data Model
Book documents are stored in the `books` collection.

Required book fields:
- `id`: string, required, unique, custom identifier (e.g., `b1`). Immutable.
- `authorId`: string, required, must match an existing custom `id` in the `authors` collection.
- `title`: string, required, non-empty.
- `publicationDate`: string, required, formatted as ISO 8601 (`YYYY-MM-DD`).

### Relationship to Authors
Every book must reference a valid `authorId`. 
- Creating (`POST`) or updating (`PUT`) a book with an `authorId` that does not exist in the `authors` collection must be rejected with a `400 Bad Request` status code.

### Routes

#### GET /books
Purpose: Return all books stored in the database.

Success:
- Status code: `200 OK`
- Response body:
  ```json
  [
    {
      "id": "b1",
      "authorId": "a1",
      "title": "To Kill a Mockingbird",
      "publicationDate": "1960-07-11"
    }
  ]
  ```

Errors:
- `500 Internal Server Error` if an unexpected server or database error occurs.

#### GET /books/:id
Purpose: Return a single book by its custom string id.

Success:
- Status code: `200 OK`
- Response body: The matching book object.

Errors:
- `404 Not Found` if no book exists with the specified `id`.
- `500 Internal Server Error` if an unexpected server or database error occurs.

#### POST /books
Purpose: Create a new book.

Request body:
```json
{
  "id": "b4",
  "authorId": "a1",
  "title": "Example Book Title",
  "publicationDate": "2026-01-15"
}
```

Success:
- Status code: `201 Created`
- Response body: The newly created book object.

Errors:
- `400 Bad Request` if required fields are missing, invalid string types are passed, or `publicationDate` is not formatted as `YYYY-MM-DD`.
- `400 Bad Request` if the submitted `authorId` does not exist in the `authors` collection.
- `409 Conflict` if the custom `id` already exists in the `books` collection.
- `500 Internal Server Error` if an unexpected server or database error occurs.

#### PUT /books/:id
Purpose: Update an existing book's details.

Request body:
```json
{
  "authorId": "a2",
  "title": "Updated Book Title",
  "publicationDate": "2026-02-20"
}
```

Success:
- Status code: `200 OK`
- Response body: The updated book object.

Errors:
- `400 Bad Request` if required fields are missing or data formats are invalid.
- `400 Bad Request` if the submitted `authorId` does not exist in the `authors` collection.
- `400 Bad Request` if the request body attempts to alter the immutable `id` field.
- `404 Not Found` if no book exists with the specified `id`.
- `500 Internal Server Error` if an unexpected server or database error occurs.

#### DELETE /books/:id
Purpose: Delete an existing book by its custom id.

Success:
- Status code: `204 No Content`
- Response body: None

Errors:
- `404 Not Found` if no book exists with the specified `id`.
- `500 Internal Server Error` if an unexpected server or database error occurs.

---

## Feature 2: Author CRUD Operations

### Goal
Implement a new `authors` collection supporting full CRUD operations, custom string IDs, complete Swagger documentation, and cascade protection on deletion.

### Data Model
Author documents are stored in the `authors` collection.

Required author fields:
- `id`: string, required, unique, custom identifier (e.g., `a1`). Immutable.
- `name`: string, required, non-empty.
- `birthYear`: integer, required, constrained between `-2000` and `2026`.

### Relationship to Books & Deletion Integrity
An author can be referenced by multiple books via `authorId`.
- Before deleting an author (`DELETE /authors/:id`), the API must query the `books` collection to check for existing books with `authorId == id`.
- If active books reference the author, the deletion request must be rejected with a `409 Conflict` status code to prevent orphaned book records.

### Routes

#### GET /authors
Purpose: Return all authors stored in the database.

Success:
- Status code: `200 OK`
- Response body:
  ```json
  [
    {
      "id": "a1",
      "name": "Harper Lee",
      "birthYear": 1926
    }
  ]
  ```

Errors:
- `500 Internal Server Error` if an unexpected server or database error occurs.

#### GET /authors/:id
Purpose: Return a single author by their custom string id.

Success:
- Status code: `200 OK`
- Response body: The matching author object.

Errors:
- `404 Not Found` if no author exists with the specified `id`.
- `500 Internal Server Error` if an unexpected server or database error occurs.

#### POST /authors
Purpose: Create a new author.

Request body:
```json
{
  "id": "a3",
  "name": "J.K. Rowling",
  "birthYear": 1965
}
```

Success:
- Status code: `201 Created`
- Response body: The newly created author object.

Errors:
- `400 Bad Request` if required fields are missing, `name` is empty, or `birthYear` is not a valid integer.
- `409 Conflict` if an author with the custom `id` already exists.
- `500 Internal Server Error` if an unexpected server or database error occurs.

#### PUT /authors/:id
Purpose: Update an existing author's details.

Request body:
```json
{
  "name": "Updated Author Name",
  "birthYear": 1970
}
```

Success:
- Status code: `200 OK`
- Response body: The updated author object.

Errors:
- `400 Bad Request` if required fields are missing or invalid data types are supplied.
- `400 Bad Request` if the request body attempts to modify the immutable `id` field.
- `404 Not Found` if no author exists with the specified `id`.
- `500 Internal Server Error` if an unexpected server or database error occurs.

#### DELETE /authors/:id
Purpose: Delete an existing author.

Success:
- Status code: `204 No Content`
- Response body: None

Errors:
- `404 Not Found` if no author exists with the specified `id`.
- `409 Conflict` if the author still has active books referencing their `id` in the `books` collection.
- `500 Internal Server Error` if an unexpected server or database error occurs.

---

## Swagger Documentation & Deployment Expectations
- Complete Swagger/OpenAPI documentation must be served at `/api-docs`.
- Every book and author endpoint (`GET`, `POST`, `PUT`, `DELETE`) must be interactive and fully testable directly from the browser.
- The API must execute successfully in both local development environments and the live Render deployment.