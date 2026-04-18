# User Service API Design

## Architecture Approach
We should use a traditional RESTful architecture for the User Service API. It is simple, well-understood by most developers, and easy to cache.

## Endpoints
- `GET /api/v1/users/{id}` - Fetch user details
- `POST /api/v1/users` - Create a new user
- `PUT /api/v1/users/{id}` - Update a user

## Data Fetching
Clients will need to make multiple requests if they want related data (e.g., fetching a user's posts requires a separate call to `/api/v1/users/{id}/posts`). This prevents over-fetching on the main user endpoint.
