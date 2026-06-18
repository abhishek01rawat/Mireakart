/**
 * NoSQL Injection Sanitization Middleware
 *
 * Recursively strips keys that start with '$' or contain '.' from
 * req.body, req.query, and req.params to block MongoDB operator injection.
 */

const sanitizeObject = (obj) => {
  if (typeof obj !== 'object' || obj === null) return obj;
  
  if (Array.isArray(obj)) {
    for (let i = 0; i < obj.length; i++) {
      sanitizeObject(obj[i]);
    }
    return obj;
  }

  for (const key of Object.keys(obj)) {
    if (key.startsWith('$') || key.includes('.')) {
      delete obj[key];
    } else {
      sanitizeObject(obj[key]);
    }
  }
  return obj;
};

const sanitize = (req, _res, next) => {
  if (req.body) sanitizeObject(req.body);
  if (req.query) sanitizeObject(req.query);
  if (req.params) sanitizeObject(req.params);
  next();
};

export default sanitize;
