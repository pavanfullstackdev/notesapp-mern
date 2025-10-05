import express from "express";
import notesRoutes from "./routes/notesRoutes.js";
const app = express();
app.use("/api/notes", notesRoutes);
const PORT = 5001;

app.listen(PORT, () => {
  console.log(`Backend Running on ${PORT}`);
});


