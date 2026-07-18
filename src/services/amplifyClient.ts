import { generateClient } from "aws-amplify/api";
import type { GraphQLResult } from "aws-amplify/api";

const client = generateClient();

interface GraphQLError {
  message: string;
}

function isGraphQLResult<T>(result: unknown): result is GraphQLResult<T> {
  return typeof result === "object" && result !== null && "data" in result;
}

export async function graphqlQuery<T>(
  query: string,
  variables?: Record<string, unknown>
): Promise<T> {
  const result = await client.graphql({ query, variables });
  if (isGraphQLResult<T>(result)) {
    if (result.errors?.length) {
      throw new Error(
        result.errors.map((e: GraphQLError) => e.message).join("; ")
      );
    }
    return result.data as T;
  }
  throw new Error("Unexpected GraphQL response shape");
}

export async function graphqlMutation<T>(
  mutation: string,
  variables?: Record<string, unknown>
): Promise<T> {
  const result = await client.graphql({ query: mutation, variables });
  if (isGraphQLResult<T>(result)) {
    if (result.errors?.length) {
      throw new Error(
        result.errors.map((e: GraphQLError) => e.message).join("; ")
      );
    }
    return result.data as T;
  }
  throw new Error("Unexpected GraphQL response shape");
}

export { client };
