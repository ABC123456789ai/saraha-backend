const errorHandler = (err, req, res, next) => {
  console.error(err);

  return res.status(err.cause?.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
    extra: err.cause?.extra,
  });
};

export default errorHandler;