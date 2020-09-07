const db = require("../db");
const express = require("express");
const router = express.Router();
const ExpressError = require("../expressError");

router.get("/", async (req, res, next) => {
  try {
    const results = await db.query(`SELECT id, comp_code FROM invoices;`);
    return res.json({ invoices: results.rows });
  } catch (e) {
    return next(e);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const invoiceResult = await db.query(
      `SELECT id, comp_code, amt, paid, add_date,paid_date FROM invoices WHERE id = $1;`,
      [req.params.id]
    );
    if (invoiceResult.rows.length === 0) {
      throw new ExpressError(`Invoice id# ${id} cannot be found`, 404);
    }
    const invoice = invoiceResult.rows[0];

    const companyResult = await db.query(
      `SELECT code, name, description FROM companies WHERE code = $1;`,
      [invoice.comp_code]
    );
    invoice.company = companyResult.rows[0];
    return res.send(invoice);
  } catch (e) {
    return next(e);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { comp_code, amt } = req.body;
    const result = await db.query(
      `INSERT INTO invoices (comp_code, amt) VALUES ($1, $2) RETURNING  id, comp_code, amt, paid, add_date, paid_date`,
      [comp_code, amt]
    );
    return res.status(201).json({ invoice: result.rows[0] });
  } catch (e) {
    return next(e);
  }
});

router.patch("/:id", async (req, res, next) => {
  try {
    const { comp_code, amt, paid, add_date, paid_date } = req.body;
    const result = await db.query(
      "UPDATE invoices SET comp_code =$1, amt=$2, paid=$3, add_date=$4, paid_date=$5 WHERE id=$6 RETURNING id, comp_code, amt, paid, add_date, paid_date",
      [comp_code, amt, paid, add_date, paid_date, req.params.id]
    );

    if (result.rows.length === 0) {
      throw new ExpressError(
        `Invoice of id#${req.params.id} does not exist`,
        404
      );
    }
    return res.json(result.rows[0]);
  } catch (e) {
    return next(e);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const result = await db.query(
      "DELETE FROM invoices WHERE id=$1 RETURNING id",
      [req.params.id]
    );
    if (result.rows.length === 0) {
      throw new ExpressError(`Invoice #${req.params.id} was not found`);
    }
    return res.json({ status: "invoice deleted" });
  } catch (e) {
    return next(e);
  }
});

module.exports = router;
