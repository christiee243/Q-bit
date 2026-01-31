const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull
} = require('graphql');
const cors = require('cors'); // Added for deployment

// ============================================
// MOCK DATA - Intentionally complete data sets
// to simulate over-fetching scenarios
// ============================================

const postsData = [
  {
    id: '1',
    title: 'Introduction to GraphQL',
    content: 'GraphQL is a query language for APIs and a runtime for fulfilling those queries with your existing data. GraphQL provides a complete and understandable description of the data in your API, gives clients the power to ask for exactly what they need and nothing more.',
    likes: 142
  },
  {
    id: '2',
    title: 'Building Mobile Apps with React Native',
    content: 'React Native lets you create truly native apps and doesn\'t compromise your users\' experiences. It provides a core set of platform agnostic native components like View, Text, and Image that map directly to the platform\'s native UI building blocks.',
    likes: 89
  },
  {
    id: '3',
    title: 'Understanding REST vs GraphQL',
    content: 'While REST has been the standard for API design for many years, GraphQL offers a more flexible approach. With GraphQL, you can request exactly the data you need, reducing over-fetching and under-fetching issues common in REST APIs.',
    likes: 256
  },
  {
    id: '4',
    title: 'Optimizing API Performance',
    content: 'Performance optimization is crucial for mobile applications. Reducing payload sizes, implementing caching strategies, and minimizing network requests can significantly improve the user experience.',
    likes: 178
  },
  {
    id: '5',
    title: 'The Future of Mobile Development',
    content: 'Mobile development continues to evolve rapidly. Cross-platform frameworks, AI integration, and 5G capabilities are shaping the future of how we build and experience mobile applications.',
    likes: 312
  }
];

const usersData = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1-555-123-4567',
    postIds: ['1', '2', '3']
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    phone: '+1-555-987-6543',
    postIds: ['4', '5']
  },
  {
    id: '3',
    name: 'Bob Johnson',
    email: 'bob.johnson@example.com',
    phone: '+1-555-456-7890',
    postIds: ['1', '4']
  }
];

// ============================================
// GRAPHQL TYPE DEFINITIONS
// ============================================

// Post Type: title, content, likes
const PostType = new GraphQLObjectType({
  name: 'Post',
  description: 'A blog post by a user',
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLString) },
    title: { type: new GraphQLNonNull(GraphQLString) },
    content: { type: new GraphQLNonNull(GraphQLString) },
    likes: { type: new GraphQLNonNull(GraphQLInt) }
  })
});

// User Type: id, name, email, phone, posts
const UserType = new GraphQLObjectType({
  name: 'User',
  description: 'A user of the application',
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLString) },
    name: { type: new GraphQLNonNull(GraphQLString) },
    email: { type: new GraphQLNonNull(GraphQLString) },
    phone: { type: new GraphQLNonNull(GraphQLString) },
    posts: {
      type: new GraphQLList(PostType),
      description: 'List of posts by this user',
      resolve: (user) => {
        // Intentionally returns ALL post data for each post
        // This simulates over-fetching - even if client only needs 'title',
        // we return title, content, and likes
        return user.postIds.map(postId =>
          postsData.find(post => post.id === postId)
        ).filter(Boolean);
      }
    }
  })
});

// ============================================
// ROOT QUERY
// ============================================

const RootQueryType = new GraphQLObjectType({
  name: 'Query',
  description: 'Root Query',
  fields: () => ({
    // Get a single user by ID
    user: {
      type: UserType,
      description: 'Get a single user by ID',
      args: {
        id: { type: GraphQLString }
      },
      resolve: (parent, args) => {
        // If no ID provided, return the first user (default behavior)
        if (!args.id) {
          return usersData[0];
        }
        return usersData.find(user => user.id === args.id);
      }
    },
    // Get all users
    users: {
      type: new GraphQLList(UserType),
      description: 'Get all users',
      resolve: () => usersData
    },
    // Get all posts
    posts: {
      type: new GraphQLList(PostType),
      description: 'Get all posts',
      resolve: () => postsData
    },
    // Get a single post by ID
    post: {
      type: PostType,
      description: 'Get a single post by ID',
      args: {
        id: { type: new GraphQLNonNull(GraphQLString) }
      },
      resolve: (parent, args) => {
        return postsData.find(post => post.id === args.id);
      }
    }
  })
});

// ============================================
// SCHEMA
// ============================================

const schema = new GraphQLSchema({
  query: RootQueryType
});

// ============================================
// EXPRESS SERVER SETUP
// ============================================

const app = express();
app.use(cors()); // Enable CORS for cross-domain simulator access
app.use(express.json()); // Fix: Enable JSON body parsing so logger can read req.body

// Middleware to log incoming queries (The "Matrix" Logger)
app.use('/graphql', (req, res, next) => {
  if (req.method === 'POST' && req.body && req.body.query) {
    console.log('='.repeat(50));
    console.log('📥 INCOMING QUERY FROM MIDDLEWARE:');
    console.log('-'.repeat(50));
    console.log(req.body.query.trim());
    console.log('='.repeat(50));
    console.log('');
  }
  next();
});

// GraphQL endpoint with GraphiQL enabled
app.use('/graphql', graphqlHTTP({
  schema: schema,
  graphiql: true, // Enable GraphiQL for browser testing
  pretty: true    // Pretty print JSON responses
}));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'GraphQL server is running' });
});

// Port and Host configuration for deployment
const PORT = process.env.PORT || 4000;
const HOST = '0.0.0.0'; // Listen on all network interfaces
app.listen(PORT, HOST, () => {
  console.log('='.repeat(50));
  console.log('🚀 GraphQL Server Started!');
  console.log('='.repeat(50));
  console.log(`📡 Local:            http://localhost:${PORT}/graphql`);
  console.log(`🌐 Network:          http://10.10.23.38:${PORT}/graphql`);
  console.log(`💓 Health Check:     http://localhost:${PORT}/health`);
  console.log('='.repeat(50));
  console.log('👥 Team members can access via the Network URL above!');
  console.log('');
  console.log('Example Queries:');
  console.log('-'.repeat(50));
  console.log('// Get user with all fields (over-fetching demo)');
  console.log(`{
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
}`);
  console.log('');
  console.log('// A mobile client might only need name and post titles,');
  console.log('// but will receive ALL data from this unoptimized server');
  console.log('='.repeat(50));
});
