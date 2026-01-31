# GraphQL Optimizer - Backend Server

A simple GraphQL server built with Node.js, Express.js, and GraphQL.js. This server intentionally returns complete data sets to simulate over-fetching scenarios that the middleware optimizer will address.

## Setup & Run

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Server
```bash
node server.js
```
Or use npm:
```bash
npm start
```

### 3. Access the Server
- **GraphQL Endpoint**: http://localhost:4000/graphql
- **GraphiQL UI**: http://localhost:4000/graphql (interactive testing)
- **Health Check**: http://localhost:4000/health

## Schema

### Types

**User**
| Field | Type | Description |
|-------|------|-------------|
| id | String! | Unique identifier |
| name | String! | User's full name |
| email | String! | Email address |
| phone | String! | Phone number |
| posts | [Post] | List of user's posts |

**Post**
| Field | Type | Description |
|-------|------|-------------|
| id | String! | Unique identifier |
| title | String! | Post title |
| content | String! | Full post content |
| likes | Int! | Number of likes |

### Queries

```graphql
# Get a single user (returns first user if no ID provided)
user(id: String): User

# Get all users
users: [User]

# Get a single post by ID
post(id: String!): Post

# Get all posts
posts: [Post]
```

## Example Queries

### Get User with All Data (Over-fetching Demo)
```graphql
{
  user {
    id
    name
    email
    phone
    posts {
      title
      content
      likes
    }
  }
}
```

### Get User by ID
```graphql
{
  user(id: "2") {
    name
    email
  }
}
```

### Get All Users with Posts
```graphql
{
  users {
    id
    name
    posts {
      title
      likes
    }
  }
}
```

## Mock Data

The server contains mock data for:
- **3 Users**: John Doe, Jane Smith, Bob Johnson
- **5 Posts**: Various blog posts with titles, content, and likes

## Over-fetching Scenario

This server is **intentionally unoptimized**. When a client requests:
```graphql
{
  user {
    name
  }
}
```

The resolver still loads the complete user object internally. The GraphQL layer filters the response, but without middleware optimization:
- All post relationships are still resolved
- Complete objects are processed before filtering
- Bandwidth could be reduced by pruning unused fields earlier

This behavior is what the middleware optimizer layer will address.
