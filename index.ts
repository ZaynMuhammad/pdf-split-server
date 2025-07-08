import { Hono } from "hono";
import { cors } from "hono/cors";
import { createRouteHandler } from "uploadthing/server";
import { uploadRouter } from "./uploadthing";
import { convertMarkdownToPdf } from "./md-to-pdf";
import { splitByChapter } from "./logic/splitByChapter";

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

app.use("/api/v1/parse-pdf", async (c) => {
  const formData = await c.req.parseBody();

  const file = formData["pdf_file"];
  if (!file || !(file instanceof File)) {
    return c.json({ message: "No valid file provided" }, 400);
  }

  // const pdf = await convertMarkdownToPdf(file.name, "output.pdf");
  const pdfSplit = splitByChapter("test.pdf");
  return c.json({ message: "PDF parsed successfully", pdfSplit });
});

console.log("Hono server is running on http://localhost:8000");

export default {
  port: 8000,
  fetch: app.fetch,
};
