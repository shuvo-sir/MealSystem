import express from "express";
import cors from "cors";
import morgan from "morgan";
import { applyClerkMiddleware, requireAuth } from "./middleware/auth.middleware.js";

import userRoutes from "./routes/user.routes.js";
import mealRoutes from "./routes/meal.routes.js";
import memberRoutes from "./routes/member.routes.js";
import mealEntryRoutes from "./routes/mealEntry.routes.js";
import financeRoutes from "./routes/finance.routes.js";
import groupNoteRoutes from "./routes/groupNote.routes.js";
import { createUser } from "./controllers/user.controller.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Apply Clerk middleware globally first
app.use(applyClerkMiddleware);

app.get("/", (req, res) => {
  res.send("Meal App API Running");
});

// PUBLIC endpoint for user creation (signup flow) - NO AUTH REQUIRED
app.post("/api/users/create", createUser);

// Protected routes - require authentication
app.use("/api/users", requireAuth, userRoutes);
app.use("/api/meals", requireAuth, mealRoutes);
app.use("/api/member", requireAuth, memberRoutes);
app.use("/api/meal-entries", requireAuth, mealEntryRoutes);
app.use("/api/finance", requireAuth, financeRoutes);
app.use("/api/group-notes", requireAuth, groupNoteRoutes);

export default app;

export default app;