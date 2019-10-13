/* eslint-disable no-param-reassign */
const httpStatus = require("http-status");
const { isCelebrate } = require("celebrate");
const { ApiError } = require("../errors");
const {
  ApiErrorHandler,
  RequestValidationErrorHandler
} = require("../errorHandlers");

// eslint-disable-next-line no-unused-vars
module.exports = async (err, req, res, next) => {
  req.err = err;

  console.log(err);

  if (err instanceof ApiError) {
    if (err.cause && err.cause.isAxiosError) {
      delete err.cause.config;
      delete err.cause.request;
      delete err.cause.response;
    }

    return ApiErrorHandler(res, err);
  }

  if (isCelebrate(err)) {
    return RequestValidationErrorHandler(res, err);
  }

  res.status(500).json({
    code: 500,
    error: httpStatus[500]
  });
};
