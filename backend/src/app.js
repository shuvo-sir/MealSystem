import express from "express";
import cors from "cors";
import morgan from "morgan";

import userRoutes from "./routes/user.routes.js";
import mealRoutes from "./routes/meal.routes.js";
import memberRoutes from "./routes/member.routes.js";
import mealEntryRoutes from "./routes/mealEntry.routes.js";
import financeRoutes from "./routes/finance.routes.js";
import groupNoteRoutes from "./routes/groupNote.routes.js";




const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/", (req, res) => {
  res.send("Meal App API Running");
});

app.use("/api/users", userRoutes);
app.use("/api/meals", mealRoutes);
app.use("/api/member", memberRoutes);
app.use("/api/meal-entries", mealEntryRoutes);
app.use("/api/finance", financeRoutes);
app.use("/api/group-notes", groupNoteRoutes);

export default app;