const asyncErrorBoundary = require("../errors/asyncErrorBoundary");
const service = require("./tables.service");
const resService = require("../reservations/reservations.service");
const resController = require("../reservations/reservations.controller");
const hasProperties = require("../utils/hasProperties");

// * BEGIN VALIDATION
const REQUIRED_PROPERTIES = ["table_name", "capacity"];

const VALID_PROPERTIES = ["table_name", "capacity", "reservation_id"];

const hasRequiredProperties = hasProperties(REQUIRED_PROPERTIES);

function hasOnlyValidProperties(req, res, nxt) {
  const { data } = req.body;

  // if (!data) {
  //   return nxt({
  //     status: 400,
  //     message: 'data required!'
  //   })
  // }

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

function nameIsValid(req, res, nxt) {
  const { table_name } = req.body.data;

  if (!table_name || table_name.length < 2) {
    return nxt({
      status: 400,
      message: `table_name must be at least two characters.`
    })
  }
  nxt();
}

function capacityisValid(req, res, nxt) {
  const { capacity } = req.body.data;

  if (!capacity || !Number.isInteger(capacity)) {
    return nxt({
      status: 400,
      message: `A table must seat at least a capacity of one.`
    })
  }
  nxt();
}

function tableIsAvailable(req, res, nxt) {
  const { reservation_id } = res.locals.table;

  if (reservation_id) {
    return nxt({
      status: 400,
      message: 'Cannot seat an occupied table.'
    })
  }
  nxt();
}

function capacityIsValid(req, res, nxt) {
  const { capacity } = res.locals.table;
  const { people } = res.locals.reservation;

  if (people > capacity) {
    return nxt({
      status: 400,
      message: 'Table does not have sufficient capacity for this party'
    });
  }
  nxt();
}

function tableIsOccupied(req, res, nxt) {
  const { reservation_id } = res.locals.table;

  if (!reservation_id) {
    return nxt({
      status: 400,
      message: 'Table is not occupied'
    })
  }
  nxt();
}
async function reservationExists(req, res, nxt) {
  const { reservation_id } = req.body.data;

  if (!reservation_id) {
    return nxt({
      status: 400,
      message: "A reservation_id is required to seat table",
    });
  }

  const foundRes = await resService.read(reservation_id);

  if (!foundRes) {
    return nxt({
      status: 404,
      message: `Reservation ${reservation_id} doesn't exist`,
    });
  }
  res.locals.reservation = foundRes;
  nxt();
}

async function tableExists(req, res, nxt) {
  const { table_id } = req.params;
  const foundTab = await service.read(table_id);

  if (!foundTab) {
    return nxt({
      status: 404,
      message: `Table ${table_id} doesn't exist`,
    });
  }

  res.locals.table = foundTab;
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
    nameIsValid,
    capacityisValid,
    asyncErrorBoundary(create),
  ],
  seatTable: [
    hasOnlyValidProperties,
    asyncErrorBoundary(reservationExists),
    asyncErrorBoundary(tableExists),
    tableIsAvailable,
    capacityIsValid,
    asyncErrorBoundary(seatTable),
  ],
  openTable: [
    asyncErrorBoundary(tableExists),
    tableIsOccupied,
    asyncErrorBoundary(openTable)
  ]
};
