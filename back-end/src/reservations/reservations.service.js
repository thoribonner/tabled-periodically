const knex = require("../db/connection");

const tn = "reservations";


/**
 * * LIST ALL RESERVATIONS ORDERED BY TIME
 * @returns A list of all reservations
 */
function list() {
  return knex(tn).select("*").orderBy("reservation_time");
}

/**
 * Return all reservations for a given date, where the status is not finished or cancelled, ordered by
 * reservation time.
 * @param reservation_date - the date of the reservation
 * @returns a list of all reservations for a given date.
 */
function listByDate(reservation_date) {
  return knex(tn)
    .select("*")
    .where({ reservation_date })
    .whereNot({ status: "finished" })
    .whereNot({ status: "cancelled" })
    .orderBy("reservation_time");
}

/**
 * * CREATE NEW RESERVATION
 * @param reservation - request body data supplied by client
 * @returns newly created reservastion
 */
function create(reservation) {
  return knex(tn)
    .insert(reservation, "*")
    .then((res) => res[0]);
}

/**
 * * READ SPECIFIC RESERVATION
 * @param reservation_id
 * @returns matching reservation
 */
function read(reservation_id) {
  return knex(tn).select("*").where({ reservation_id }).first();
}

/**
 * * UPDATE STATUS OF RESERVATION MATCHING RESERVATION ID
 * @param reservation_id 
 * @param status - 'booked', 'seated', 'cancelled', 'finished'
 * @returns reservation with newly updated status
 */
function updateStatus(reservation_id, status) {
  return knex(tn)
    .where({ reservation_id })
    .update({ status })
    .then(() => read(reservation_id));
}

/**
 * * SEARCH RESERVATIONS BY MOBILE_NUMBER
 * @param mobile_number 
 * @returns an array of reservations with partial matches to mobile_number
 */
function searchByPhone(mobile_number) {
  return knex(tn)
    .whereRaw(
      "translate(mobile_number, '() -', '') like ?",
      `%${mobile_number.replace(/\D/g, "")}%`
    )
    .orderBy("reservation_date");
}

/**
 * * UPDATE A RESERVATION
 * @param updatedRes - request body data supplied by client
 * @returns newly updated reservation
 */
function update(updatedRes) {
  return knex(tn)
    .select("*")
    .where({ reservation_id: updatedRes.reservation_id })
    .update(updatedRes, "*")
    .then((res) => res[0]);
}

module.exports = {
  list,
  listByDate,
  create,
  read,
  updateStatus,
  searchByPhone,
  update,
};
