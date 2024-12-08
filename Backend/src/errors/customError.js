const ErrorMessage = require('./errorMessage')
const ErrorCode = require('./errorCode')

/**
 * For error, we would like to see the followings information
 * 1. The correct HTTP Status Code (custom)
 * 2. The error message
 * 3. The error name
 * 4. The error stack
 */

class CustomError extends Error {
  constructor(message, statusCode, name) {
    super(message)
    this.statusCode = statusCode
    this.name = name || "CustomError"
  }
}

class BadRequestError extends CustomError {
  constructor(message=ErrorMessage.BAD_REQUEST, statusCode=ErrorCode.BAD_REQUEST, name="BadRequestError") {
    super(message, statusCode, name)
  }
}

class UnauthorizedError extends CustomError {
  constructor(message=ErrorMessage.UNAUTHORIZED, statusCode=ErrorCode.UNAUTHORIZED, name="UnauthorizedError") {
    super(message, statusCode, name)
  }
}

class NotFoundError extends CustomError {
  constructor(message=ErrorMessage.NOT_FOUND, statusCode=ErrorCode.NOT_FOUND, name="NotFoundError") {
    super(message, statusCode, name)
  }
}

class InternalServerError extends CustomError {
  constructor(message=ErrorMessage.INTERNAL_SERVER_ERROR, statusCode=ErrorCode.INTERNAL_SERVER_ERROR, name="InternalServerError") {
    super(message, statusCode, name)
  }
}

class UserAlreadyExistError extends BadRequestError {
  constructor(message=ErrorMessage.BAD_REQUEST, statusCode=ErrorCode.BAD_REQUEST, name="UserAlreadyExistError") {
    super(message, statusCode, name)
  }
}

class DatabaseError extends CustomError {
  constructor(message="Something wrong with Database", statusCode=ErrorCode.INTERNAL_SERVER_ERROR, name="DatabaseError") {
    super(message, statusCode, name)
  }
}

class RedisConnectionError extends CustomError {
  constructor(message="Error in connecting to Redis", statusCode=ErrorCode.INTERNAL_SERVER_ERROR, name="RedisConnectionError") {
    super(message, statusCode, name)
  }
}

class MissingField extends CustomError {
  constructor(message="Missing field!", statusCode=ErrorCode.BAD_REQUEST, name="MissingField") {
    super(message, statusCode, name)
  }
}

module.exports = {
  CustomError,
  BadRequestError,
  UnauthorizedError,
  NotFoundError,
  InternalServerError,
  DatabaseError,
  RedisConnectionError,
  UserAlreadyExistError,
  MissingField
}
