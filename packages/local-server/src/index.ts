import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { cors } from "hono/cors";
import { stream } from "hono/streaming";
import fs from "fs";
import path from "path";

const app = new Hono();

app.use("*", cors());

app.post("/upload", async (c) => {
  const formData = await c.req.formData();
  const file = formData.get("file") as File;

  if (!file) return c.text("No file uploaded", 400);

  const buffer = await file.arrayBuffer();
  const uploadsDir = path.join(process.cwd(), "uploads");
  fs.mkdirSync(uploadsDir, { recursive: true });
  const filePath = path.join(uploadsDir, file.name);
  fs.writeFileSync(filePath, Buffer.from(buffer));

  return c.text("File received!");
});

export const startLocalServer = (port = 7000) => {
  serve({ fetch: app.fetch, port }, () => {
    console.log(`🚀 Hono server running on http://localhost:${port}`);
  });
};
