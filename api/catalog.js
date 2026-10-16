const { CATALOG } = require('../lib/planner');
module.exports = (req, res) => res.status(200).json({ catalog: CATALOG.map(({ id, name, price }) => ({ id, name, price })) });
