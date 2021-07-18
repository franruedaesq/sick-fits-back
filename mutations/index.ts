import { graphQLSchemaExtension } from "@keystone-next/keystone/schema";
import addToCart from "./addToCart";
import removeFromCart from "./removeFromCart";

// fake graphql tagged template literal
const graphql = String.raw;
export const extendGraphqlSchema = graphQLSchemaExtension({
  typeDefs: graphql`
    type Mutation {
      addToCart(productId: ID): CartItem
    }
    type Mutation {
      removeFromCart(productId: ID): CartItem
    }
  `,
  resolvers: {
    Mutation: {
      addToCart,
      removeFromCart,
    },
  },
});
