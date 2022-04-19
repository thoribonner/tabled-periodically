const knex = require("../db/connection");
const reduceProperties = require("../utils/reduce-properties");
// const mapProperties = require("../utils/map-properties");

const tn = "tables";
const res = "reservations";

const addReservation = reduceProperties("table_id", {
  // reservation_id: ['reservation', null, 'reservation_id'],
  first_name: ["reservation", null, "first_name"],
  last_name: ["reservation", null, "last_name"],
  people: ["reservation", null, "people"],
});

function list() {
  return knex(`${tn} as tn`)
    .leftJoin(`${res} as res`, "tn.reservation_id", "res.reservation_id")
    .select(
      "tn.*",
      // "res.reservation_id",
      "res.first_name",
      "res.last_name",
      "res.people"
    )
    .then(addReservation) // add reservation info to each table
    .then((tables) => {
      return tables.map((table) => {
        // if (table.reservation_id) {
        return {
          ...table,
          reservation: table.reservation[0], // make reservation array an object
        };
      });
    }).then(tables => {
      return tables.sort((a, b) => a.table_name.toLowerCase() < b.table_name.toLowerCase() ? -1 : 1)
    });
}
// function list() {
//   return knex(tn).select("*").orderBy("table_name");
// }

function read(table_id) {
  return knex(tn).select("*").where({ table_id }).first();
}

function create(table) {
  return knex(tn)
    .insert(table, "*")
    .then((newTable) => newTable[0]);
}

function seatTable(reservation_id, table_id) {
  return knex(res)
    .where({ reservation_id })
    .update({ status: "seated" })
    .then(() => {
      return knex(tn)
        .where({ table_id })
        .update({ reservation_id })
        .returning("*");
    });
}

function openTable(reservation_id, table_id) {
  return knex(res)
    .where({ reservation_id })
    .update({ status: "finished" })
    .returning("*")
    .then(() => {
      return knex(tn)
        .where({ table_id })
        .update({ reservation_id: null })
        .returning("*");
    });
}

module.exports = {
  list,
  read,
  create,
  seatTable,
  openTable,
};
