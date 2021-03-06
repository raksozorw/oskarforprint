const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();
const app = express();
const apiPort = process.env.PORT || 3000;
const path = require("path");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(bodyParser.json());

const stripe = require("stripe")(process.env.STRIPE_SK);
app.use(express.static(path.join(__dirname, "build")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

app.get("/fail", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

app.get("/success", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

app.post("/create-checkout-session", async (req, res) => {
  console.log(req.body.data.items);
  console.log(req.body.data.customer);
  const { items } = req.body.data;
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: items.map((item) => ({
      quantity: item.quantity,
      price: item.sku,
    })),
    mode: "payment",
    success_url: "https://oskar-for-print.herokuapp.com/success",
    cancel_url: "https://oskar-for-print.herokuapp.com/fail",
  });

  res.json({ id: session.id });
});

app.post("/productList", async (req, res) => {
  const products = await stripe.products.list({
    limit: 6,
  });
  const prices = await stripe.prices.list({
    limit: 6,
  });

  const data = { products, prices };
  res.send(data);
});

app.listen(apiPort || 3000, () =>
  console.log(`Server running on port ${apiPort}`)
);
