const { ZodError } = require('zod');

const errorHandler = (err, req, res, next) => {
  console.error('Error Trace:', err);

  // Handle Zod input validation errors
  if (err instanceof ZodError) {
    const errorDetails = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors: errorDetails,
    });
  }

  // Handle Prisma unique constraint violations (P2002)
  if (err.code === 'P2002') {
    const fields = err.meta && err.meta.target ? err.meta.target.join(', ') : 'field';
    return res.status(400).json({
      success: false,
      message: `A record with this ${fields} already exists.`,
    });
  }

  // Default handler
  const statusCode = err.status || err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
};

module.exports = {
  errorHandler,
};
