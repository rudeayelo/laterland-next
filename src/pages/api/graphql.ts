import { ApolloServer, gql } from "apollo-server-micro";
import { verifyUserIdToken } from "../../helpers";
import {
  checkpoint,
  deletePost,
  pinboardToken,
  syncPending,
  post,
  posts,
  tags,
  updateCheckpoint,
  updatePost
} from "../../graphql-resolvers";

const typeDefs = gql`
  type Query {
    user: User!
    posts(toread: ToRead, fetchFromPinboard: Boolean): [Post]!
    post(id: String): Post
    tags(url: String): Tags
  }

  type Mutation {
    delete(url: String, id: String): Result
    updateCheckpoint(id: String): Checkpoint
    updatePost(id: String!, description: String!, tags: String!): Result
  }

  type User {
    checkpoint: String
    syncPending: Boolean
    pinboardToken: String!
  }

  type Post {
    id: String!
    href: String!
    description: String!
    time: String!
    tags: String
    extended: String
  }

  type Result {
    result: String
  }

  type Tags {
    tags: [String]!
  }

  type Checkpoint {
    checkpoint: String
  }

  enum ToRead {
    yes
    no
  }
`;

const resolvers = {
  Query: {
    user: () => ({}),
    posts,
    post,
    tags
  },
  Mutation: {
    delete: deletePost,
    updateCheckpoint,
    updatePost
  },
  User: {
    checkpoint,
    pinboardToken,
    syncPending
  }
};

const context = async ({ req }) => {
  const uid = await verifyUserIdToken(req.headers.authentication);

  return { uid };
};

const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
  context,
  introspection: true,
  playground: true
});

export const config = {
  api: {
    bodyParser: false
  }
};

export default apolloServer.createHandler({ path: "/api/graphql" });
