const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
app.use(cors());
app.use(express.json());

// uploads folder create
if (!fs.existsSync("uploads")) fs.mkdirSync("uploads");
app.use("/uploads", express.static("uploads"));

// MySQL connection
const db = mysql.createConnection({
  host: "localhost",   // deploy ke baad change karna hai
  user: "root",
  password: "132006aug",
  database: "shop"
});

db.connect(err => {
  if (err) console.log("DB Error:", err);
  else console.log("MySQL Connected ✅");
});

// Multer (image upload)
const storage = multer.diskStorage({
  destination: "uploads",
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// ADD PRODUCT
app.post("/products", upload.single("image"), (req, res) => {
  const { name, price, quantity } = req.body;

  if (!req.file) return res.send("Image required ❌");

  const image = req.file.filename;

  db.query(
    "INSERT INTO products (name, price, quantity, image) VALUES (?, ?, ?, ?)",
    [name, price, quantity, image],
    (err) => {
      if (err) return res.send(err);
      res.send("Product Added ✅");
    }
  );
});

// GET ALL PRODUCTS
app.get("/products", (req, res) => {
  db.query("SELECT * FROM products", (err, result) => {
    if (err) return res.send(err);
    res.json(result);
  });
});

// SEARCH PRODUCT
app.get("/products/search/:name", (req, res) => {
  db.query(
    "SELECT * FROM products WHERE name LIKE ?",
    [`%${req.params.name}%`],
    (err, result) => {
      if (err) return res.send(err);
      res.json(result);
    }
  );
});

// DELETE PRODUCT
app.delete("/products/:id", (req, res) => {
  db.query("DELETE FROM products WHERE id=?", [req.params.id], (err) => {
    if (err) return res.send(err);
    res.send("Deleted ✅");
  });
});

// ✅ IMPORTANT FIX (PORT)
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});