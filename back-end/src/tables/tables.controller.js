const asyncErrorBoundary = require("../errors/asyncErrorBoundary");
const service = require("./tables.service");

async function list(req, res) {
  res.json({ data: await service.list() });
}

module.exports = {
  list: asyncErrorBoundary(list),
};
