const asyncErrorBoundary = require("../errors/asyncErrorBoundary");
const hasProperties = require("../utils/hasProperties");
const service = require("./reservations.service");

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
];

const VALID_STATUS = ["booked", "seated", "finished", "cancelled"];

const hasRequiredProperties = hasProperties(REQUIRED_PROPERTIES);

function hasOnlyValidProperties(req, res, nxt) {
  const { data } = req.body;

  if (!data) {
    return nxt({
      status: 400,
      message: "data required!",
    });
  }

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
 * The function `timeIsValid` takes in a request object and returns a string if the time is invalid, or
 * `false` if the time is valid
 * @param req - the request object
 * @returns A false boolean value or error message.
 */
function timeIsValid(req) {
  const { reservation_time } = req.body.data;
  const timeFormat = /\d\d:\d\d/;

  const errors = [];
  // is reservation_time provided?
  if (!reservation_time) {
    errors.push("A time is required for a reservation.");
  }

  // is the reservation_time is in the correct format?
  if (!reservation_time.match(timeFormat)) {
    errors.push(`reservation_time must be a valid time.`);
  }

  // is the reservation_time between 10:30AM and 9:30PM?
  // -hours of operation
  if (reservation_time < "10:30" || reservation_time > "21:20") {
    errors.push("Reservation must be between 10:30AM and 9:30PM.");
  }

  if (errors.length) return errors;
  return false;
}

/**
 * "If the reservation_date is not in the correct format, or is in the past, or is on a Tuesday, return
 * an error message. Otherwise, return false."
 *
 * The function is written in a way that makes it easy to add more validation rules. For example, if we
 * wanted to add a rule that reservations must be made at least 24 hours in advance, we could add the
 * following code to the function:
 *
 *
 * * is the reservation_date at least 24 hours in advance?
 * if (resDate - today < 24 * 60 * 60 * 1000) {
 *   return "Reservations must be made at least 24 hours in advance.";
 * }
 * @param req - the request object
 * @returns A false boolean value or error message.
 */
function dateIsValid(req) {
  const { reservation_date, reservation_time } = req.body.data;

  const today = new Date();
  const resDate = new Date(`${reservation_date} ${reservation_time}`);
  const dateRegEx = /^\d{4}\-\d{1,2}\-\d{1,2}$/;

  const errors = [];

  // is the reservation_date in the correct format?
  if (!reservation_date.match(dateRegEx)) {
    errors.push(`reservation_date must be a valid date.`);
  }

  // is the reservation_date of the past?
  if (resDate < today) {
    console.log("resDate:", resDate);
    console.log("today:", today);
    errors.push("Reservation must be made for a future date.");
  }

  // is the reservation_date on a valid business day?
  if (resDate.getDay() === 2) {
    errors.push(`Sorry! We're closed on Tuesdays.`);
  }
  if (errors.length) return errors;
  return false;
}

/**
 * "If the people value is not an integer or is less than 1, return an error message."
 *
 * @param req - the request object
 * @returns A false boolean value or error message.
 */
function peopleIsValid(req) {
  const { people } = req.body.data;

  // is people a valid integer greater than 0?
  if (!Number.isInteger(people) || people < 1) {
    return "You cannot make a reservation for 0 people.";
  }

  return false;
}

/**
 * If the status is not "booked", return an error message. Otherwise, return false
 * @param req - the request object
 * @returns A false boolean value or error message.
 */
function statusBooked(req) {
  // default status to booked
  const { status = "booked" } = req.body.data;

  // is the status anything other than
  if (status != "booked") {
    return `A new reservation status must be "booked" - you put ${status}.`;
  }
  return false;
}

/**
 * "If the reservation is already finished, return an error message."
 *
 * @param res - the response object.
 * @param nxt - This is a function that you call when you want to move on to the next middleware.
 * @returns An error message or the next middleware function.
 */
function statusFinished(req, res, nxt) {
  const { status } = res.locals.reservation;

  // is the reservation already finished?
  if (status === "finished") {
    return nxt({
      status: 400,
      message: "A finished reservation cannot be updated",
    });
  }
  return nxt();
}

/**
 * If the status is not a valid status, return an error.
 * @param req - the request object
 * @param nxt - This is a function that you call when you want to move on to the next middleware.
 * @returns An error message or the next middleware function.
 */
function statusIsValid(req, res, nxt) {
  const { status } = req.body.data;

  // is req status a valid status?
  if (!VALID_STATUS.includes(status)) {
    return nxt({
      status: 400,
      message: `Status must be either ${VALID_STATUS.join(
        ", "
      )}. You put '${status}.'`,
    });
  }
  return nxt();
}

/**
 * If the reservation doesn't exist, send a 404 response with a message saying the reservation doesn't
 * exist.
 * @param req - the request object
 * @param res - the response object
 * @param nxt - This is a function that will be called when the middleware is done.
 * @returns An error message or the next middleware function.
 */
async function reservationExists(req, res, nxt) {
  const { reservation_id } = req.params;
  const foundRes = await service.read(reservation_id);

  // does this reservation exist?
  if (!foundRes) {
    return nxt({
      status: 404,
      message: `Reservation ${reservation_id} doesn't exist`,
    });
  }
  res.locals.reservation = foundRes;
  nxt();
}

/**
 * It takes in a request object, and a next function. It then creates an array of
 * errors. If the array of errors is greater than 0, it returns the next function with a status of 400
 * and a message of the errors. If the array of errors is less than 0, it returns the next function
 * @param req - the request object
 * @param nxt - is a function that is called when the middleware is done.
 * @returns An array of errors
 */
function createValidation(req, res, nxt) {
  let errors = [];

  // creates an array of errors
  if (timeIsValid(req)) errors = [...errors, ...timeIsValid(req)];
  if (dateIsValid(req)) errors = [...errors, ...dateIsValid(req)];
  if (peopleIsValid(req)) errors.push(peopleIsValid(req));
  if (statusBooked(req)) errors.push(statusBooked(req));
  if (errors.length > 0) {
    if (errors.length === 1) {
      return nxt({
        status: 400,
        message: errors[0],
      });
    } else {
      return nxt({
        status: 400,
        message: errors,
      });
    }
  }
  nxt();
}

/**
 * It takes in a request object, and a next function. It then creates an array of
 * errors. If the array of errors is greater than 0, it returns the next function with a status of 400
 * and a message of the errors. If the array of errors is less than 0, it returns the next function
 * @param req - the request object
 * @param nxt - is a function that is called when the middleware is done.
 * @returns An array of errors
 */
function updateValidation(req, res, nxt) {
  let errors = [];

  // creates an array of errors
  if (timeIsValid(req)) errors = [...errors, ...timeIsValid(req)];
  if (dateIsValid(req)) errors = [...errors, ...dateIsValid(req)];
  if (peopleIsValid(req)) errors.push(peopleIsValid(req));
  if (errors.length > 0) {
    if (errors.length === 1) {
      return nxt({
        status: 400,
        message: errors[0],
      });
    } else {
      return nxt({
        status: 400,
        message: errors,
      });
    }
  }
  nxt();
}
// * END VALIDATION

// * LIST
async function list(req, res) {
  const { date, mobile_number } = req.query;

  if (date) {
    // date query?
    res.json({ data: await service.listByDate(date) });
  } else if (mobile_number) {
    // mobile number query?
    res.json({ data: await service.searchByPhone(mobile_number) });
  } else {
    // no query?
    res.json({ data: await service.list() });
  }
}

// * CREATE
async function create(req, res) {
  res.status(201).json({ data: await service.create(req.body.data) });
}

// * READ
function read(req, res) {
  res.json({ data: res.locals.reservation });
}

// * UPDATE STATUS
async function updateStatus(req, res) {
  const { reservation_id } = res.locals.reservation;
  const { status } = req.body.data;

  res.json({ data: await service.updateStatus(reservation_id, status) });
}

// * UPDATE
async function update(req, res) {
  const { reservation_id } = res.locals.reservation;

  const updatedRes = {
    ...req.body.data,
    reservation_id,
  };

  res.json({ data: await service.update(updatedRes) });
}

module.exports = {
  list: asyncErrorBoundary(list),
  create: [
    hasRequiredProperties,
    hasOnlyValidProperties,
    createValidation,
    asyncErrorBoundary(create),
  ],
  read: [asyncErrorBoundary(reservationExists), read],
  updateStatus: [
    asyncErrorBoundary(reservationExists),
    statusFinished,
    statusIsValid,
    asyncErrorBoundary(updateStatus),
  ],
  update: [
    asyncErrorBoundary(reservationExists),
    hasRequiredProperties,
    hasOnlyValidProperties,
    statusFinished,
    updateValidation,
    asyncErrorBoundary(update),
  ],
};
