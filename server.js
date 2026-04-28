const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;
const FILE_PATH = path.join(__dirname, "produse.json");

app.use(express.json());
app.use(express.static("public"));

const readData = () => {
  const rawData = fs.readFileSync(FILE_PATH);
  return JSON.parse(rawData);
};

app.get("/api/search", (req, res) => {
  const queryName = req.query.name.toLowerCase();
  const data = readData();

  const product = data.products.find((p) => p.name.toLowerCase() === queryName);

  if (product) {
    res.json({ found: true, product });
  } else {
    res.json({ found: false });
  }
});

app.post("/api/add", (req, res) => {
  const { name, price, quantity } = req.body;
  const data = readData();

  if (!name || isNaN(price) || isNaN(quantity)) {
    return res.status(400).json({ error: "Date invalide." });
  }

  const newProduct = {
    name: name,
    price: parseFloat(price),
    quantity: parseInt(quantity, 10),
  };

  data.products.push(newProduct);

  fs.writeFileSync(FILE_PATH, JSON.stringify(data, null, 2));

  res.json({ success: true, product: newProduct });
});

app.listen(PORT, () => {
  console.log(`Serverul rulează fenomenal la adresa http://localhost:${PORT}`);
});
