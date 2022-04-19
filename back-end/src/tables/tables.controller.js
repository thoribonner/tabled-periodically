const asyncErrorBoundary = require("../errors/asyncErrorBoundary");
const service = require("./tables.service");
const resService = require("../reservations/reservations.service");
const hasProperties = require("../utils/hasProperties");

// * BEGIN VALIDATION
const REQUIRED_PROPERTIES = ["table_name", "capacity"];

const VALID_PROPERTIES = ["table_name", "capacity", "reservation_id"];

const hasRequiredProperties = hasProperties(REQUIRED_PROPERTIES);

function hasOnlyValidProperties(req, res, nxt) {
  const { data } = req.body;

  if (!data) {
    return nxt({
      status: 400,
      message: 'data required!'
    })
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
 * If the table_name is not provided or is less than two characters, return an error message.
 * Otherwise, return false
 * @param req - the request object
 * @returns A false boolean value or error message.
 */
function nameIsValid(req) {
  const { table_name } = req.body.data;

  // is name provided and atleast 2 characters?
  if (!table_name || table_name.length < 2) {
    return `table_name must be at least two characters.`;
  }
  return false;
}

/**
 * If the capacity is not a number or is less than 1, return an error message.
 * @param req - the request object
 * @returns A false boolean value or error message.
 */
function capacityisValid(req) {
  const { capacity } = req.body.data;

  // is capacity a valid integer greater than 0?
  if (!capacity || !Number.isInteger(capacity)) {
    return `A table must seat at least a capacity of one.`;
  }
  return false;
}

/**
 * If the table is occupied, return an error
 * @param req - the request object
 * @param res - the response object
 * @param nxt - a function that will be called when the middleware is done.
 * @returns An error message or the next middleware function.
 */
function tableIsAvailable(req, res, nxt) {
  const { reservation_id } = res.locals.table;

  // has the table already been sat?
  if (reservation_id) {
    return nxt({
      status: 400,
      message: 'Cannot seat an occupied table.'
    })
  }
  nxt();
}

/**
 * If the number of people in the reservation is greater than the capacity of the table, return an
 * error.
 * @param req - the request object
 * @param res - the response object
 * @param nxt - a function that will be called when the middleware is done.
 * @returns An error message or the next middleware function.
 */
function tableCanSeat(req, res, nxt) {
  const { capacity } = res.locals.table;
  const { people } = res.locals.reservation;

  // does the table have the capacity for this party?
  if (people > capacity) {
    return nxt({
      status: 400,
      message: 'Table does not have sufficient capacity for this party'
    });
  }
  nxt();
}

/**
 * If the table is not occupied, return an error
 * @param req - the request object
 * @param res - the response object
 * @param nxt - a function that will be called when the middleware is done.
 * @returns An error message or the next middleware function.
 */
function tableIsOccupied(req, res, nxt) {
  const { reservation_id } = res.locals.table;

  // has the table already been sat?
  if (!reservation_id) {
    return nxt({
      status: 400,
      message: 'Table is not occupied'
    })
  }
  nxt();
}

/**
 * If the reservation has already been seated, then don't let the user seat the reservation
 * @param req - the request object
 * @param res - the response object
 * @param nxt - a function that will be called when the middleware is done.
 * @returns An error message or the next middleware function.
 */
function isSeatable(req, res, nxt) {
  const { status } = res.locals.reservation;

  // is the reservation already been seated?
  if (status === "seated") {
    return nxt({
      status: 400,
      message: 'Party has already been seated'
    })
  }
  nxt();
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
  const { reservation_id } = req.body.data;

  // is reservation_id provided?
  if (!reservation_id) {
    return nxt({
      status: 400,
      message: "A reservation_id is required to seat table",
    });
  }

  const foundRes = await resService.read(reservation_id);

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
 * If the table doesn't exist, send a 404 response with a message saying the table doesn't
 * exist.
 * @param req - the request object
 * @param res - the response object
 * @param nxt - This is a function that will be called when the middleware is done.
 * @returns An error message or the next middleware function.
 */
async function tableExists(req, res, nxt) {
  const { table_id } = req.params;
  const foundTab = await service.read(table_id);

  // does the table exist?
  if (!foundTab) {
    return nxt({
      status: 404,
      message: `Table ${table_id} doesn't exist`,
    });
  }

  res.locals.table = foundTab;
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
  const errors = [];

  // creates an array of errors
  if (nameIsValid(req)) errors.push(nameIsValid(req));
  if (capacityisValid(req)) errors.push(capacityisValid(req));

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
  res.json({ data: await service.list() });
}

// * CREATE
async function create(req, res) {
  res.status(201).json({ data: await service.create(req.body.data) });
}

async function seatTable(req, res) {
  const { reservation_id } = res.locals.reservation;
  const { table_id } = res.locals.table;

  res.json({ data: await service.seatTable(reservation_id, table_id) });
}

async function openTable(req, res) {
  const { table_id, reservation_id } = res.locals.table;

  res.json({ data: await service.openTable(reservation_id, table_id) });
}

module.exports = {
  list: asyncErrorBoundary(list),
  create: [
    hasOnlyValidProperties,
    hasRequiredProperties,
    createValidation,
    asyncErrorBoundary(create),
  ],
  seatTable: [
    hasOnlyValidProperties,
    asyncErrorBoundary(reservationExists),
    isSeatable,
    asyncErrorBoundary(tableExists),
    tableIsAvailable,
    tableCanSeat,
    asyncErrorBoundary(seatTable),
  ],
  openTable: [
    asyncErrorBoundary(tableExists),
    tableIsOccupied,
    asyncErrorBoundary(openTable)
  ]
};
