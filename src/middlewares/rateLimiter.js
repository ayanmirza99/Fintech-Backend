
const rateLimitMap = new Map();

const RATE_LIMIT = 10; 
const TIME_WINDOW = 60 * 1000; 

export const rateLimiter = (req, res, next) => {
  const userId = req.user?.id || req.ip; 
  const now = Date.now();

  const userData = rateLimitMap.get(userId) || { count: 0, lastReset: now };

  if (now - userData.lastReset > TIME_WINDOW) {
    userData.count = 1;
    userData.lastReset = now;
  } else {
    userData.count++;
  }

  if (userData.count > RATE_LIMIT) {
    return res.status(429).json({
      error: "Rate limit exceeded. Try again in a minute.",
    });
  }

  rateLimitMap.set(userId, userData);
  next();
};


