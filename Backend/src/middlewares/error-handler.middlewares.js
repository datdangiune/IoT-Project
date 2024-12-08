const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500
  const message = err.message || "Internal Server Error"
  const name = err.name || "InternalServerError"

  res.status(statusCode).json({
    statusCode: statusCode,
    message: message,
    name: name,
    stack: err.stack
  })
}

module.exports = errorHandler
