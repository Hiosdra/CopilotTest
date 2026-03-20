/**
 * Simple HTTP server for integration testing.
 * Serves static HTML pages for web automation tests.
 */

import { createServer, IncomingMessage, ServerResponse } from "http";
import { readFile } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export interface TestServer {
  port: number;
  url: string;
  start(): Promise<void>;
  stop(): Promise<void>;
}

export interface TestApiResponse {
  users?: Array<{ id: number; name: string; email: string }>;
  user?: { id: number; name: string; email: string };
  status?: string;
  message?: string;
}

export function createTestServer(): TestServer {
  let server: ReturnType<typeof createServer> | null = null;
  const port = 8765; // Fixed port for testing

  // In-memory data store for API testing
  let users = [
    { id: 1, name: "Alice Smith", email: "alice@example.com" },
    { id: 2, name: "Bob Jones", email: "bob@example.com" },
  ];
  let nextUserId = 3;

  const start = async (): Promise<void> => {
    return new Promise((resolve, reject) => {
      server = createServer(async (req: IncomingMessage, res: ServerResponse) => {
        const url = req.url || "/";
        const method = req.method || "GET";

        // Set CORS headers
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type");

        if (method === "OPTIONS") {
          res.writeHead(200);
          res.end();
          return;
        }

        // API endpoints
        if (url.startsWith("/api/")) {
          res.setHeader("Content-Type", "application/json");

          // GET /api/users - List all users
          if (url === "/api/users" && method === "GET") {
            res.writeHead(200);
            res.end(JSON.stringify({ users }));
            return;
          }

          // GET /api/users/:id - Get specific user
          const getUserMatch = url.match(/^\/api\/users\/(\d+)$/);
          if (getUserMatch && method === "GET") {
            const userId = parseInt(getUserMatch[1]);
            const user = users.find((u) => u.id === userId);
            if (user) {
              res.writeHead(200);
              res.end(JSON.stringify({ user }));
            } else {
              res.writeHead(404);
              res.end(JSON.stringify({ status: "error", message: "User not found" }));
            }
            return;
          }

          // POST /api/users - Create new user
          if (url === "/api/users" && method === "POST") {
            let body = "";
            req.on("data", (chunk) => {
              body += chunk.toString();
            });
            req.on("end", () => {
              try {
                const data = JSON.parse(body);
                const newUser = {
                  id: nextUserId++,
                  name: data.name,
                  email: data.email,
                };
                users.push(newUser);
                res.writeHead(201);
                res.end(JSON.stringify({ user: newUser }));
              } catch (err) {
                res.writeHead(400);
                res.end(JSON.stringify({ status: "error", message: "Invalid JSON" }));
              }
            });
            return;
          }

          // DELETE /api/users/:id - Delete user
          const deleteUserMatch = url.match(/^\/api\/users\/(\d+)$/);
          if (deleteUserMatch && method === "DELETE") {
            const userId = parseInt(deleteUserMatch[1]);
            const index = users.findIndex((u) => u.id === userId);
            if (index !== -1) {
              users.splice(index, 1);
              res.writeHead(200);
              res.end(JSON.stringify({ status: "success", message: "User deleted" }));
            } else {
              res.writeHead(404);
              res.end(JSON.stringify({ status: "error", message: "User not found" }));
            }
            return;
          }

          // 404 for unknown API routes
          res.writeHead(404);
          res.end(JSON.stringify({ status: "error", message: "Not found" }));
          return;
        }

        // Serve static HTML pages
        try {
          let filePath: string;
          if (url === "/" || url === "/index.html") {
            filePath = join(__dirname, "test-pages", "index.html");
          } else if (url === "/login.html") {
            filePath = join(__dirname, "test-pages", "login.html");
          } else if (url === "/dashboard.html") {
            filePath = join(__dirname, "test-pages", "dashboard.html");
          } else if (url === "/form.html") {
            filePath = join(__dirname, "test-pages", "form.html");
          } else {
            res.writeHead(404, { "Content-Type": "text/plain" });
            res.end("Not Found");
            return;
          }

          const content = await readFile(filePath, "utf-8");
          res.writeHead(200, { "Content-Type": "text/html" });
          res.end(content);
        } catch (err) {
          res.writeHead(500, { "Content-Type": "text/plain" });
          res.end("Internal Server Error");
        }
      });

      server.listen(port, () => {
        console.log(`Test server started on http://localhost:${port}`);
        resolve();
      });

      server.on("error", reject);
    });
  };

  const stop = async (): Promise<void> => {
    return new Promise((resolve) => {
      if (server) {
        server.close(() => {
          console.log("Test server stopped");
          resolve();
        });
      } else {
        resolve();
      }
    });
  };

  return {
    port,
    url: `http://localhost:${port}`,
    start,
    stop,
  };
}
