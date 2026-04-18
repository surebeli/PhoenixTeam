# User Service API Design

## Architecture Approach
We should adopt GraphQL for the User Service API. It provides maximum flexibility for our front-end clients, allowing them to request exactly the data they need in a single round-trip.

## Schema
```graphql
type User {
  id: ID!
  name: String!
  email: String!
  posts: [Post!]!
}

type Query {
  user(id: ID!): User
}

type Mutation {
  createUser(name: String!, email: String!): User!
}
```

## Data Fetching
A single request can fetch a user and all their related posts, eliminating the N+1 request problem on the client side. We will handle backend performance using DataLoader.
