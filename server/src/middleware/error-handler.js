export function errorHandler(err, req, res, next) {
  console.error('Error:', err);
  const status = err.status || err.statusCode || (err.message?.includes('images are allowed') ? 400 : 500);
  res.status(status).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
}
