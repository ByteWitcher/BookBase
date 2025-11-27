# 1. Introduction

## 1.1 Project Overview

BookBase is a RESTful API designed to power a community-driven digital library platform. It allows users to browse a catalog of books (PDFs), submit suggestions for new additions, track their reading activity, and rate, like, or favorite titles. The platform is managed by administrators who moderate content and maintain the catalog.

## 1.2 Actors and Roles

The system identifies two distinct actor types with different permissions:

| Role  | Description |
|-------|-------------|
| **USER**  | The standard user of the platform. Can register, log in, browse books, manage their favorites/likes, submit reviews, and propose new books. |
| **ADMIN** | A user with elevated privileges. Has all the rights of a User, can also manage the catalog (add/edit/delete books) and manage user-submitted propositions. |

# 2. Concepts and Data Models

The platform is organized around several central concepts that define how users interact with books and how reading activity is monitored.

## User

- Represents individuals who have accounts on the platform.
- Each user has a profile with a username, email, and password.
- Users can be regular members or administrators.
- Regular users explore books, track their reading progress, and engage with the catalog.
- Administrators validate book requests and manage the platform.

## Book

- Main items in the catalog.
- Each book includes title, description, authors, language, and publication info.
- Provides a link to its digital file (external storage).
- May be hidden while awaiting administrator approval.
- User-generated metrics: average rating, likes, reading progress indicators.

## Genre and Book Type

- Genres classify books (fantasy, mystery, historical fiction, etc.).
- Book types refer to form (novel, essay, autobiography, etc.).
- Administrators manage and may deactivate them.

## Book Request

- Users suggest new books for the catalog.
- Requests await administrator review.
- Approved requests generate visible books.
- Refused requests remain recorded with an admin comment.

## Review

- Captures users’ opinions about books.
- Each review contains a rating and optional comment.
- A user can only review a book once.
- Any modification triggers recalculation of the book’s average rating.

## Likes and Favorites

- Users can like or favorite books.
- Favorites act as a personal collection for quick access.
- Likes contribute to a book’s popularity metrics.

## Reading Progress & Sessions

- Represents how much of a book a user has read and their reading activity.
- A reading session includes start time, end time, and pages read.
- Weekly statistics: total reading time, pages read, reading speed (pages/hour).
- Progress tracking supports gamification (streaks and achievements).

# 3. Functional Requirements

## Authentication

- Users can create accounts and log in securely using token-based authentication.
- Upon registration, users receive the “User” role.
- Both regular users and administrators log in using the same mechanism.

## Browsing the Catalog

- All users can browse available books.
- Search and filter by title, author, genre, type, etc.
- Book details include metadata, reviews, likes, and reading statistics.

## User Interactions

Users can:

- Mark or unmark books as favorites
- Like or unlike books
- View their list of favorite books
- Track their reading progress and activity

## Reviews and Ratings

- Users can create, edit, or delete reviews.
- Each change updates the book’s average rating automatically.

## Book Suggestions

- Users can propose new books through book requests.
- Track status: pending, approved, or refused.

## Catalog Administration

- Administrators add, update, or remove books.
- Books created by admins are instantly visible.

## Moderation

- Administrators review and moderate book requests.
- Approved requests generate visible catalog entries; refused ones remain with comments.
- Administrators may delete any review.

## Genre and Book Type Management

- Genres and book types are visible to all users.
- Only administrators can create, update, or deactivate them.

## Reading Progress Tracking

- Users log reading sessions (time, pages).
- System tracks total progress for each book.
- Weekly reports summarize:
  - Total reading time
  - Pages read
  - Reading speed (pages/hour)
  - Streaks and achievements
- Users can view their reading history and progress at any time.

# 4. Non-Functional Requirements

## 4.1 Security

- **Authentication:** API secured by JWT (JSON Web Tokens), passed via `Authorization: Bearer <token>`.
- **Authorization (RBAC):** Backend checks role from JWT and restricts access (e.g., `[POST] /books` for ADMINs only).
- **Passwords:** Never stored in plain text; hashed using strong algorithms (e.g., bcrypt).
- **Input Validation:** All client data validated to prevent injections and errors.

## 4.2 Performance

- **Response Time:** GET requests on lists (e.g., `/books`) must respond in under 500ms.
- **Database:** Indexes on frequently queried fields (e.g., `user.email`, `book.title`).

## 4.3 File Storage (S3)

- **Decoupling:** Node.js API does not serve PDF files.
- **External Storage:** PDFs uploaded to Amazon S3 compatible object storage.
- **Reference:** API stores only the URL (`s3PdfUrl`) pointing to S3. Clients use this URL directly.

## 4.4 Reliability

- **Error Handling:** API returns semantic HTTP status codes and clear JSON error messages.
- **Availability:** API should be stateless for replication and scaling.

## 4.5 Scalability

- Application designed for containerization (Docker).
- S3 for files and managed database contribute to scalability.

## Business Rules / Constraints

- A user cannot like or review their own book if they’re also an admin who added it.
- A review must contain a rating between 0–5; otherwise, reject with 400.
- Only approved book requests can lead to book creation (if approved manually).