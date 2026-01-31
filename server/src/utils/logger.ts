// Simple logger for production
export const logger = {
  info: (...args: unknown[]) => console.log("[INFO]", ...args),
  error: (...args: unknown[]) => console.error("[ERROR]", ...args),
  warn: (...args: unknown[]) => console.warn("[WARN]", ...args),
  debug: (...args: unknown[]) => {
    if (process.env.NODE_ENV !== "production") {
      console.log("[DEBUG]", ...args);
    }
  },
};

export default logger;
