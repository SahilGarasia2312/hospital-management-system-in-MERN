// server.js — Fortified Enterprise Application Entry Point
import "dotenv/config";
import { connectDB } from "./src/config/db.js";
import app from "./src/app.js";

const PORT = process.env.PORT || 8000;

// ─── fix: Start server ONLY after DB connects so Render health-check doesn't
//     pass prematurely and serve 503s on every route. ─────────────────────────
const startServer = async () => {
  try {
    await connectDB(); // wait for MongoDB before opening the HTTP port
    // fix: Bind to 0.0.0.0 (all interfaces) — Render's reverse proxy sends traffic
    //      to the container's external interface; binding to localhost (127.0.0.1 default)
    //      makes the process unreachable from outside → 503 on every route.
    app.listen(PORT, "0.0.0.0", () =>
      console.log(`🚀 HPMS Server running on http://0.0.0.0:${PORT}`)
    );
  } catch (err) {
    // connectDB already logs the error and exits, but guard here too
    console.error("❌ Fatal startup error:", err.message);
    process.exit(1);
  }
};

startServer();