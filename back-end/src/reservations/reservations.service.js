const knex = require("../db/connection");

const tn = "reservations";

/**
 * Return all rows from the reservations table, ordered by the reservation_time column.
 * @returns A list of all reservations
 */
function list() {
  return knex(tn).select("*").orderBy("reservation_time");
}




module.exports = {
  list,
}
