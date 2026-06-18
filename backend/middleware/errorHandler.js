const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message;
  if (err.name === 'CastError' && err.kind === 'ObjectId') { statusCode = 404; message = 'Resource not found'; }
  if (err.code === 11000) { statusCode = 400; message = `Duplicate value for ${Object.keys(err.keyValue)[0]}`; }
  if (err.name === 'ValidationError') { statusCode = 400; message = Object.values(err.errors).map((v) => v.message).join(', '); }
  if (err.name === 'JsonWebTokenError') { statusCode = 401; message = 'Invalid token'; }
  if (err.name === 'TokenExpiredError') { statusCode = 401; message = 'Token expired'; }
  res.status(statusCode).json({ success: false, message, stack: process.env.NODE_ENV === 'production' ? null : err.stack });
};

const notFound = (req, res, next) => { const error = new Error(`Not Found - ${req.originalUrl}`); res.status(404); next(error); };

export { errorHandler, notFound };
