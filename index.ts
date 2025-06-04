import { Hono } from "hono";
import { cors } from "hono/cors";
import { createRouteHandler } from "uploadthing/server";
import { uploadRouter } from "./uploadthing";
import { trpcServer } from "@hono/trpc-server";
import { appRouter } from "./routers/_app";

const app = new Hono();

app.use(
  "*",
  cors({
    origin: "http://localhost:5173",
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: [
      "Content-Type",
      "Authorization",
      "x-uploadthing-api-key",
      "x-uploadthing-version",
      "uploadthing-hook",
    ],
  })
);

const handlers = createRouteHandler({
  router: uploadRouter,
});

app.all("/api/uploadthing", (context) => handlers(context.req.raw));

app.use("/trpc/*", trpcServer({ router: appRouter }));

console.log("Hono server is running on http://localhost:8000");

export default {
  port: 8000,
  fetch: app.fetch,
};
