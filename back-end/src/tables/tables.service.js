const knex = require("../db/connection");

const tn = "tables";
const res = "reservations";

function list() {
  return knex(tn).select("*").orderBy("table_name");
}

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
  openTable
};
