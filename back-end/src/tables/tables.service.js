const knex = require("../db/connection");

const tn = "tables";

function list() {
  return knex(tn).select("*").orderBy("table_name");
}

module.exports = {
  list
}