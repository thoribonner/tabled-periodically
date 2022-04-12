const asyncErrorBoundary = require("../errors/asyncErrorBoundary");
const service = require("./reservations.service");
const hasProperties = require('../utils/hasProperties')

// * BEGIN VALIDATION

const VALID_PROPERTIES = [
  "first_name",
  "last_name",
  "mobile_number",
  "reservation_date",
  "reservation_time",
  "people",
  "status",
  "reservation_id",
  "created_at",
  "updated_at",
];

const REQUIRED_PROPERTIES = [
  "first_name",
  "last_name",
  "mobile_number",
  "reservation_date",
  "reservation_time",
  "people",
  "status",
];

/* A function that checks if the request body has the required properties. */
const hasRequiredProperties = hasProperties(REQUIRED_PROPERTIES.join(" "));

/**
 * "If the request body has a data property, and that data property has any keys that are not in the
 * VALID_PROPERTIES array, then return a 400 error with a message that lists the invalid fields."
 *
 * The function is a middleware function, so it takes three arguments: req, res, and nxt
 * @param req - The request object
 * @param res - the response object
 * @param nxt - This is the next function that will be called after the middleware.
 * @returns An array of invalid fields
 */
function hasOnlyValidProperties(req, res, nxt) {
  const { data = {} } = req.body;

  const invalidFields = Object.keys(data).filter(
    (field) => !VALID_PROPERTIES.includes(field)
  );

  if (invalidFields.length)
    return nxt({
      status: 400,
      message: `Invalid Field(s): ${invalidFields.join(", ")}`,
    });
  nxt();
}

/**
 * If the reservation time is not a valid time, the reservation date is not a valid date, the
 * reservation date is in the past, the reservation time is not between 10:30AM and 9:30PM, or the
 * number of people is not a positive integer, then return an error.
 * @param req - The request object.
 * @param res - the response object
 * @param nxt - This is a function that is passed to the middleware function. It is used to call the
 * next middleware function in the stack.
 * @returns the next middleware function in the stack.
 */
function timeAndDateValid(req, res, nxt) {
  const { reservation_date, reservation_time, people } = req.body.data;

  const today = new Date();
  const resDate = new Date(`${reservation_date} ${reservation_time}`);
  const validPeople = Number.isInteger(people);

  const timeFormat = /\d\d:\d\d/;
  const dateRegEx = /^\d{4}\-\d{1,2}\-\d{1,2}$/;

  if (!reservation_time.match(timeFormat)) {
    return nxt({
      status: 400,
      message: `${reservation_time} is not a valid time.`,
    });
  }

  if (!reservation_date.match(dateRegEx)) {
    return nxt({
      status: 400,
      message: `${reservation_date} is not a valid date.`,
    });
  }

  if (resDate < today) {
    return nxt({
      status: 400,
      message: "Reservation must be made for a future date.",
    });
  }

  if (reservation_time < "10:30" || reservation_time > "21:20") {
    return nxt({
      status: 400,
      message: "Reservation must be between 10:30AM and 9:30PM.",
    });
  }

  if (!validPeople || people <= 0) {
    return nxt({
      status: 400,
      message: "You cannot make a reservation for 0 people.",
    });
  }

  nxt();
}

// * END VALIDATION

/**
 * It returns a list of appointments, either by date or by phone number
 * @param req - The request object.
 * @param res - The response object.
 * @returns array of all reservation objects || matching reservation objects
 */
// * LIST
async function list(req, res) {
  const { date } = req.query;

  if (date) {
    res.json({ data: await service.listByDate(date) });
  } else {
    res.json({ data: await service.list() });
  }
}

/**
 * Create a new user and return the new user's data as JSON
 * @param req - The request object.
 * @param res - The response object.
 */
// * CREATE
async function create(req, res) {
  res.status(201).json({ data: await service.create(req.body.data) });
}

module.exports = {
  list: asyncErrorBoundary(list),
  create: [
    hasRequiredProperties,
    hasOnlyValidProperties,
    timeAndDateValid,
    asyncErrorBoundary(create),
  ],
};
