const { z } = require('zod');

const validateInput = (schema) => (req, res, next) => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Zod v4 uses .issues, not .errors
      const messages = (error.issues || []).map((e) => `${e.path.join('.')}: ${e.message}`);
      return res.status(400).json({ message: 'Validation failed', errors: messages });
    }
    return res.status(400).json({ message: 'Invalid input data' });
  }
};

module.exports = validateInput;
