
/**
 * It takes an error object, a request object, and a response object, and it sends a response with a
 * status code and a message
 * @param err - the error object
 * @param req - The request object.
 * @param res - the response object
 */
function errorHandler(err, req, res) {
  const { status = 500, message = "Something went wrong!" } = err;
  res.status(status).json({ error: message });
}

module.exports = errorHandler;
