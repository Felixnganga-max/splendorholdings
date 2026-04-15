const winston = require("winston");
const path = require("path");

const { combine, timestamp, printf, colorize, errors, json } = winston.format;

const isProduction = process.env.NODE_ENV === "production";
const isVercel = process.env.VERCEL === "1";

// Dev format
const devFormat = combine(
  colorize({ all: true }),
  timestamp({ format: "HH:mm:ss" }),
  errors({ stack: true }),
  printf(({ level, message, timestamp, stack }) =>
    stack
      ? `[${timestamp}] ${level}: ${message}\n${stack}`
      : `[${timestamp}] ${level}: ${message}`,
  ),
);

// Prod format
const prodFormat = combine(timestamp(), errors({ stack: true }), json());

const transports = [
  new winston.transports.Console({
    format: isProduction ? prodFormat : devFormat,
    silent: process.env.NODE_ENV === "test",
  }),
];

// Only use file logs if NOT on Vercel
if (isProduction && !isVercel) {
  transports.push(
    new winston.transports.File({
      filename: path.join(__dirname, "../../logs/error.log"),
      level: "error",
      maxsize: 5 * 1024 * 1024,
      maxFiles: 5,
      format: prodFormat,
    }),
    new winston.transports.File({
      filename: path.join(__dirname, "../../logs/combined.log"),
      maxsize: 10 * 1024 * 1024,
      maxFiles: 5,
      format: prodFormat,
    }),
  );
}

const logger = winston.createLogger({
  level: isProduction ? "warn" : "debug",
  transports,
  exitOnError: false,
});

module.exports = logger;
