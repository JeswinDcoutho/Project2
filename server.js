const express = require("express");
const client = require("prom-client");

const app = express();
const PORT = process.env.PORT || 3000;
const VERSION = process.env.APP_VERSION || "1.0";

const register = new client.Registry();
client.collectDefaultMetrics({ register });

const httpRequests = new client.Counter({
  name: "nodejs_http_requests_total",
  help: "Total HTTP requests",
  labelNames: ["method", "route", "status"]
});
register.registerMetric(httpRequests);

const httpDuration = new client.Histogram({
  name: "nodejs_http_request_duration_seconds",
  help: "HTTP request duration in seconds",
  labelNames: ["method", "route"]
});
register.registerMetric(httpDuration);

app.use((req, res, next) => {
  const start = process.hrtime();
  res.on("finish", () => {
    const diff = process.hrtime(start);
    const duration = diff[0] + diff[1] / 1e9;
    const route = req.route?.path || req.path;
    httpRequests.inc({ method: req.method, route, status: res.statusCode });
    httpDuration.observe({ method: req.method, route }, duration);
  });
  next();
});

app.get("/", (req, res) => {
  res.json({
    message: "Node.js DevOps CI/CD Application",
    version: VERSION,
    environment: process.env.NODE_ENV || "development"
  });
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "UP", version: VERSION });
});

app.get("/metrics", async (req, res) => {
  res.set("Content-Type", register.contentType);
  res.end(await register.metrics());
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Node.js application version ${VERSION} running on port ${PORT}`);
});
