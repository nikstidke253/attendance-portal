const userLastActivity = new Map();

const inactivityTimeout = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (token) {
    const lastActivity = userLastActivity.get(token);
    const now = Date.now();
    
    if (lastActivity && (now - lastActivity) > 15 * 60 * 1000) {
      userLastActivity.delete(token);
      return res.status(401).json({ error: 'Session expired due to inactivity' });
    }
    
    userLastActivity.set(token, now);
  }
  
  next();
};

module.exports = { inactivityTimeout };