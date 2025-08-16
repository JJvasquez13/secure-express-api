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

// 1. Validar variables de entorno
validateEnv();

// 2. CORS debe ir primero (antes de cualquier middleware que maneje cookies o CSRF)
const allowedOrigins = [
  process.env.FRONTEND_URL || "http://localhost:5173",
  "http://localhost:5003", // API de tareas
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

// 3. Middleware de seguridad
app.use(helmet());
app.use(mongoSanitize());
app.use(xss());
app.use(compression());

// 4. Límite global de peticiones
// const globalLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000,
//   max: 100000,
// });
// app.use(globalLimiter);

// 5. Cookies y CSRF (después de CORS)
app.use(cookieParser());
const csrfProtection = csrf({
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  },
});
app.use(csrfProtection);

// 6. Enviar XSRF-TOKEN accesible al frontend
app.use((req, res, next) => {
  res.cookie("XSRF-TOKEN", req.csrfToken(), {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
  next();
});

// 7. Body parser
app.use(express.json({ limit: "10kb" }));

// 8. Logging (solo en desarrollo)
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// 9. Ocultar encabezado "X-Powered-By"
app.disable("x-powered-by");

// 10. Conexión a MongoDB
connectDB();

// 11. Documentación Swagger
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// 12. Rutas de autenticación y usuario
app.use("/auth", authRoutes);
app.use("/users", userRoutes);

// 13. Ruta raíz para obtener XSRF-TOKEN
app.get("/", (req, res) => {
  res.status(200).json({ message: "API de seguridad activa" });
});

// 14. Middleware de manejo de errores
app.use(errorHandler);

// 15. Iniciar servidor
const PORT = process.env.PORT || 5002;
const HOST = "localhost";
app.listen(PORT, HOST, () => {
  logger.info(`Server running on http://${HOST}:${PORT}`);
});
