const knex = require("../db/connection");

const tn = "reservations";

/**
 * Return all rows from the reservations table, ordered by the reservation_time column.
 * @returns A list of all reservations
 */
function list() {
  return knex(tn).select("*").orderBy("reservation_time");
}

/**
 * Return all reservations for a given date, where the status is not finished or cancelled, ordered by
 * reservation time.
 * @param reservation_date - the date of the reservation
 * @returns An array of reservation objects matching date
 */
 function listByDate(reservation_date) {
  return knex(res)
    .select("*")
    .where({ reservation_date })
    .whereNot({ status: "finished" })
    .whereNot({ status: "cancelled" })
    .orderBy("reservation_time");
}

/**
 * It takes a reservation object, inserts it into the database, and returns the created reservation
 * @param reservation - the reservation object that we want to create
 * @returns The created reservation.
 */
 function create(reservation) {
  return knex(res)
    .insert(reservation, "*")
    .returning("*")
    .then((createdRes) => createdRes[0]);
}


module.exports = {
  list,
  listByDate,
  create
}
