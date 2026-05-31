import express from "express";
import cors from "cors";
import morgan from "morgan";
import { applyClerkMiddleware, requireAuth } from "./middleware/auth.middleware.js";
import autoUserCreation from "./middleware/autoUserCreation.middleware.js";
import errorHandler from "./middleware/errorHandler.middleware.js";
import { publicLimiter, authenticatedLimiter, financeLimiter, mealLimiter } from "./middleware/rateLimit.middleware.js";

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

// Apply auto-user creation middleware for authenticated requests
app.use(autoUserCreation);

app.get("/", (req, res) => {
  res.send("Meal App API Running");
});

// PUBLIC endpoint for user creation (signup flow) - NO AUTH REQUIRED
// Apply rate limiting to prevent signup spam
app.post("/api/users/create", publicLimiter, createUser);

// Protected routes - require authentication
// Apply appropriate rate limiters to each route group
app.use("/api/users", requireAuth, authenticatedLimiter, userRoutes);
app.use("/api/meals", requireAuth, mealLimiter, mealRoutes);
app.use("/api/member", requireAuth, authenticatedLimiter, memberRoutes);
app.use("/api/meal-entries", requireAuth, mealLimiter, mealEntryRoutes);
app.use("/api/finance", requireAuth, financeLimiter, financeRoutes);
app.use("/api/group-notes", requireAuth, authenticatedLimiter, groupNoteRoutes);

// Global error handler middleware (must be last)
app.use(errorHandler);

export default app;

