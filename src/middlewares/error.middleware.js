const errorHandler = (err, req, res, next) => {
  console.error(err);
  const statusCode = err.cause?.status || 500;
  const isProduction = process.env.NODE_ENV === "production";
  return res.status(statusCode).json({
    success: false,
    message:
      isProduction && statusCode === 500
        ? "Internal Server Error"
        : err.message || "Internal Server Error",

    ...(err.cause?.extra && {
      extra: err.cause.extra,
    }),
  });
};
export default errorHandler;
