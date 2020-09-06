const db = require("../db");
const { router } = require("../app");

router.get("/", async (req, res, next) => {
  try {
    const results = await db.query(`SELECT name, description FROM companies;`);
    return results.json(results.rows);
  } catch (e) {
    return next(e);
  }
});

module.exports = router;
