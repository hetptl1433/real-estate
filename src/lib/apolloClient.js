import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';

// Prefer env var but fall back to the provided URI
const uri = process.env.NEXT_PUBLIC_GRAPHQL_URI || 'https://graphql.eng.meridiancapital.com/graphql';

const client = new ApolloClient({
  link: new HttpLink({ uri }),
  cache: new InMemoryCache(),
});

export default client;

