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
    .then((res) => res[0]);
}

function read(reservation_id) {
  return knex(tn).select("*").where({ reservation_id }).first();
}

function updateStatus(reservation_id, status) {
  return knex(tn)
    .where({ reservation_id })
    .update({ status })
    .then(() => read(reservation_id));
}

module.exports = {
  list,
  listByDate,
  create,
  read,
  updateStatus,
};
