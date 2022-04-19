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
  const { data ={} } = req.body;

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

function statusIsValid(req, res, nxt) {
  const { status } = req.body.data;

  if (!VALID_STATUS.includes(status)) {
    return nxt({
      status: 400,
      message: `Status must be either ${VALID_STATUS.join(
        ", "
      )}. You put '${status}'`,
    });
  }
  nxt();
}

function statusBooked(req, res, nxt) {
  const { status = "booked" } = req.body.data;

  if (status != "booked") {
    return nxt({
      status: 400,
      message: `A new reservation status must be "booked" - you put ${status}`,
    });
  }
  nxt();
}

function statusFinished(req, res, nxt) {
  const { status } = res.locals.reservation;

  if (status === "finished") {
    return nxt({
      status: 400,
      message: "A finished reservation cannot be updated",
    });
  }
  nxt();
}

async function reservationExists(req, res, nxt) {
  const { reservation_id } = req.params;
  const foundRes = await service.read(reservation_id);
  if (!foundRes) {
    return nxt({
      status: 404,
      message: `Reservation ${reservation_id} doesn't exist`,
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
  } else if (mobile_number) {
    res.json({ data: await service.searchByPhone(mobile_number) });
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
    timeIsValid,
    dateIsValid,
    peopleIsValid,
    statusBooked,
    asyncErrorBoundary(create),
  ],
  read: [asyncErrorBoundary(reservationExists), read],
  updateStatus: [
    asyncErrorBoundary(reservationExists),
    statusIsValid,
    statusFinished,
    asyncErrorBoundary(updateStatus),
  ],
  update: [
    asyncErrorBoundary(reservationExists),
    hasRequiredProperties,
    hasOnlyValidProperties,
    timeIsValid,
    dateIsValid,
    peopleIsValid,
    statusFinished,
    asyncErrorBoundary(update),
  ],
};
