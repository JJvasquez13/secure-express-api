const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const cookieParser = require("cookie-parser");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const compression = require("compression");
const csrf = require("csurf");
const connectDB = require("./config/db");
const validateEnv = require("./config/env");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const errorHandler = require("./middleware/errorMiddleware");
const logger = require("./utils/logger");
const swaggerUi = require("swagger-ui-express");
const yaml = require("yamljs");
const swaggerDocument = yaml.load("./swagger.yaml");

const app = express();

// Validate environment variables
validateEnv();

// CORS configuration
const allowedOrigins = [
  process.env.FRONTEND_URL || "http://localhost:5173",
  "http://localhost:5003", // API de tareas
  "http://localhost5000", // API de NutriBoost
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "X-XSRF-TOKEN"],
  })
);

// Security middleware
app.use(helmet());
app.use(mongoSanitize());
app.use(xss());
app.use(compression());

// Global rate limiter (general protection)
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use(globalLimiter);

// Cookies and CSRF protection
app.use(cookieParser());
const csrfProtection = csrf({
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  },
});
app.use(csrfProtection);

// XSRF-TOKEN access to FrontEnd
app.use((req, res, next) => {
  res.cookie("XSRF-TOKEN", req.csrfToken(), {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
  next();
});

// Body parser
app.use(express.json({ limit: "10kb" }));

// Logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Hide X-Powered-By header
app.disable("x-powered-by");

// Connect to MongoDB
connectDB();

// Routes
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use("/auth", authRoutes);
app.use("/users", userRoutes);

// Active security API
app.get("/", (req, res) => {
  res.status(200).json({ message: "API de seguridad activa" });
});

// Error handling middleware
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5002;
const HOST = "localhost";
app.listen(PORT, HOST, () => {
  logger.info(`Server running on http://${HOST}:${PORT}`);
});
