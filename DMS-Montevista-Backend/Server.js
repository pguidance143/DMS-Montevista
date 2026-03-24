const express = require("express");
const cors = require("cors");
const app = express();
const port = 50000;

// Middleware
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());

// Routers
const loginRoutes = require("./src/login/routes");
const usersRoutes = require("./src/users/routes");
const rolesRoutes = require("./src/roles/routes");
const activitylogRoutes = require("./src/activitylog/routes");
const sectorRoutes = require("./src/sector/routes");
const subsectorRoutes = require("./src/subsector/routes");

// API Endpoints
app.use("/api/v1", loginRoutes);
app.use("/api/v1/users", usersRoutes);
app.use("/api/v1", loginRoutes);
app.use("/api/v1/users", usersRoutes);
app.use("/api/v1/roles", rolesRoutes);
app.use("/api/v1/activitylog", activitylogRoutes);
app.use("/api/v1/sectors", sectorRoutes);
app.use("/api/v1/subsectors", subsectorRoutes);

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
