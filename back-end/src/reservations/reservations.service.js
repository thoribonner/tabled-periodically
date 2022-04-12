const knex = require("../db/connection");

const tn = "reservations";

function list() {
  return knex(tn).select("*").orderBy("reservation_time");
}
function listByDate(reservation_date) {
  return knex(tn)
    .select("*")
    .where({ reservation_date })
    .whereNot({ status: "finished" })
    .whereNot({ status: "cancelled" })
    .orderBy("reservation_time");
}

function create(reservation) {
  return knex(tn)
    .insert(reservation, "*")
    .then((createdRes) => createdRes[0]);
}
function read(reservation_id) {
  return knex(tn).select("*").where({ reservation_id }).first();
}

module.exports = {
  list,
  listByDate,
  create,
  read,
};
