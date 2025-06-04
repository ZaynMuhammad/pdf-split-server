import { type FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";

export const createContext = async ({
  req,
  resHeaders,
}: FetchCreateContextFnOptions) => {
  const token = req.headers.get("authorization");
  const user = token === "secret-token" ? { id: "1", name: "Admin" } : null;
  return {
    req,
    resHeaders,
    user,
  };
};

export type Context = Awaited<ReturnType<typeof createContext>>;
