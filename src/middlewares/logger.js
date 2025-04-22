import RequestLog from '../models/RequestLog.js'
export const logger = (req, res, next) => {
    const start = Date.now();
  
    res.on("finish", async () => {
      const duration = `${Date.now() - start}ms`;
  
      const log = {
        timestamp: new Date().toISOString(),
        method: req.method,
        endpoint: req.originalUrl,
        status: res.statusCode,
        userId: req.user?.id || "Guest",
        ip: req.headers["x-forwarded-for"] || req.connection.remoteAddress,
        userAgent: req.headers["user-agent"],
        duration,
      };
  
      console.log(log);
  

      await RequestLog.create(log);
    });
  
    next();
  };
  

  