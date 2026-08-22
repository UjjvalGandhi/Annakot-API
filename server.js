import dotenv from "dotenv";
import express from "express";
import serverless from "serverless-http";
import bodyParser from "body-parser";
import cors from "cors";

// Load environment variables
dotenv.config();

const app = express();
app.use(bodyParser.json());
app.use(cors());

// Database
import db from "./models/index.js"; // Ensure this path is correct

// db.sequelize
//   .sync({ force: false })
//   .then(() => {
//     console.log("Synced db.");
//   })
//   .catch((err) => {
//     console.error("Failed to sync db: " + err.message);
//   });
console.log("Synced db.");

// Routes
import userRoutes from "./routes/user.routes.js";
import gernalRoutes from "./routes/gernal.routes.js";

userRoutes(app);
gernalRoutes(app);

app.get("/", (req, res) => {
  res.json({ message: "Welcome to Ankoot 2025 Application." });
});

app.post("/", (req, res) => {
  res.json({ message: "Welcome to Ankoot 2025 Application." });
});

const PORT = process.env.SERVER_LOCAL_PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`Server listening on port http://localhost:${PORT}`);
});

process.on("unhandledRejection", (err) => {
  console.log(`[unhandledRejection] Shutting down server...`);
  console.log(err);
  server.close(() => {
    process.exit(1);
  });
});

// Export server for serverless
export const appServer = serverless(app);
