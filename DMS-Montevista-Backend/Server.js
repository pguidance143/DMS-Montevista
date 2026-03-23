const express = require("express");
const cors = require("cors");
const app = express();
const port = 50000;

// Middleware
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());

// Routers
const loginRoutes = require("./src/login/routes");

// API Endpoints
app.use("/api/v1", loginRoutes);

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
