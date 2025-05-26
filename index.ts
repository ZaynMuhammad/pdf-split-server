import { Hono } from "hono";
import { cors } from "hono/cors";
import { createRouteHandler } from "uploadthing/server";
import { uploadRouter } from "./uploadthing";
import PDFParse from "pdf-parse";

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

app.post("/api/v1/parse-pdf", async (c) => {
  try {
    const formData = await c.req.parseBody();
    const file = formData.pdf_file as File;

    if (!file) {
      return c.json({ success: false, error: "No file provided" }, 400);
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const pdfData = await PDFParse(buffer);

    return c.json({
      success: true,
      data: {
        text: pdfData.text,
        pages: pdfData.numpages,
        info: pdfData.info,
      },
    });
  } catch (error) {
    console.error("PDF parsing error:", error);
    return c.json({ success: false, error: "Failed to parse PDF" }, 500);
  }
});

// Health check endpoint
app.get("/health", (c) => {
  return c.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.get("/", (c) => {
  console.log(c.req.query("file"));
  return c.text("Hello Bun + Hono!");
});

app.get("/users/:id", (c) => {
  const id = c.req.param("id");
  return c.json({ userId: id, message: `User ID is ${id}` });
});

app.post("/submit", async (c) => {
  try {
    const body = await c.req.json();
    console.log("Received data:", body);
    return c.json({ success: true, receivedData: body }, 201);
  } catch (error) {
    return c.json({ success: false, error: "Invalid JSON" }, 400);
  }
});

app.post("/api/upload", async (c) => {
  console.log("/upload");
  const formData = await c.req.parseBody();
  const file = formData.file as File;
  console.log("file", file);
  return c.json({ success: true, file: file }, 201);
});

console.log("Hono server is running on http://localhost:8000");

// Export the app for Bun's HTTP server
export default {
  port: 8000, // You can specify the port here
  fetch: app.fetch,
};
