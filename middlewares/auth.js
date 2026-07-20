const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
  try {
    const apiKey = req.headers['x-api-key'] || req.headers['authorization']?.replace('Bearer ', '');
    
    if (!apiKey) {
      return res.status(401).json({ error: 'API key is missing' });
    }

    const user = await User.findOne({ apiKey });
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid API key' });
    }

    // Attach user to request for downstream use
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth Middleware Error:', error);
    res.status(500).json({ error: 'Internal server error during authentication' });
  }
};

module.exports = authMiddleware;
