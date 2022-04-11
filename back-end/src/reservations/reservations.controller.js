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

const hasRequiredProperties = hasProperties(REQUIRED_PROPERTIES);

function hasOnlyValidProperties(req, res, nxt) {
  const { data } = req.body;

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
function timeIsValid(req, res, nxt) {
  const { reservation_time } = req.body.data;
  const timeFormat = /\d\d:\d\d/;

  if (!reservation_time) {
    return nxt({
      status: 400,
      message: "A time is required for a reservation.",
    });
  }

  if (!reservation_time.match(timeFormat)) {
    return nxt({
      status: 400,
      message: `reservation_time must be a valid time.`,
    });
  }

  if (reservation_time < "10:30" || reservation_time > "21:20") {
    return nxt({
      status: 400,
      message: "Reservation must be between 10:30AM and 9:30PM.",
    });
  }
  nxt();
}

function dateIsValid(req, res, nxt) {
  const { reservation_date, reservation_time } = req.body.data;

  const today = new Date();
  const resDate = new Date(`${reservation_date} ${reservation_time}`);
  const dateRegEx = /^\d{4}\-\d{1,2}\-\d{1,2}$/;

  if (!reservation_date.match(dateRegEx)) {
    return nxt({
      status: 400,
      message: `reservation_date must be a valid date.`,
    });
  }

  if (resDate < today) {
    return nxt({
      status: 400,
      message: "Reservation must be made for a future date.",
    });
  }

  if (resDate.getDay() === 2) {
    return nxt({
      status: 400,
      message: `Sorry! We're closed on Tuesdays.`,
    });
  }
  nxt();
}

function peopleIsValid(req, res, nxt) {
  const { people } = req.body.data;

  if (!Number.isInteger(people) || people < 1) {
    return nxt({
      status: 400,
      message: "You cannot make a reservation for 0 people.",
    });
  }

  nxt();
}

async function reservationExists(req, res, nxt) {
  const { reservationId } = req.params;
  const foundRes = await service.read(reservationId);

  if (!foundRes) {
    return nxt({
      status: 404,
      message: `Reservation ${reservationId} doesn't exist`,
    });
  }
  res.locals.reservation = foundRes;
  nxt();
}


// * END VALIDATION

// * LIST
async function list(req, res) {
  const { date, mobile_number } = req.query;

  if (date) {
    res.json({ data: await service.listByDate(date) });
  } else {
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

module.exports = {
  list: asyncErrorBoundary(list),
  create: [
    hasRequiredProperties,
    hasOnlyValidProperties,
    timeIsValid,
    dateIsValid,
    peopleIsValid,
    asyncErrorBoundary(create),
  ],
  read: [asyncErrorBoundary(reservationExists), read],
};
