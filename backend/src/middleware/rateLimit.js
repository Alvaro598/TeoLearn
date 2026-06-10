const buckets = new Map();

export function rateLimit({ windowMs = 60000, max = 20 } = {}) {
  return (req, res, next) => {
    const forwardedFor = req.headers["x-forwarded-for"];
    const ip = Array.isArray(forwardedFor)
      ? forwardedFor[0]
      : forwardedFor?.split(",")[0]?.trim() || req.ip || "unknown";

    const now = Date.now();
    const key = `${req.method}:${req.originalUrl}:${ip}`;
    const current = buckets.get(key);

    if (!current || current.resetAt <= now) {
      buckets.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }

    if (current.count >= max) {
      return res.status(429).json({
        error: "Demasiadas solicitudes. Intenta nuevamente en unos minutos."
      });
    }

    current.count += 1;
    return next();
  };
}
