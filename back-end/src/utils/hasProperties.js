/**
 * It takes a list of properties and returns a middleware function that checks if the response body
 * contains all of the properties
 * @param properties - An array of strings that represent the properties that are required.
 * @returns A function that takes in a response, request, and next function.
 */
function hasProperties(...properties) {
  return function (res, req, nxt) {
    const { data = {} } = res.body;

    try {
      properties.forEach((property) => {
        if (!data[property]) {
          const error = new Error(`A '${property}' property is required.`);
          error.status = 400;
          throw error;
        }
      });
      nxt();
    } catch (error) {
      nxt(error);
    }
  };
}

module.exports = hasProperties;