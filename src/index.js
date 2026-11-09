const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const apiRoutes = require("./routes/api");
const giftRoutes = require("./routes/gift-routes");
const readerRoutes = require("./routes/reader-routes");

// Load .env from project root
dotenv.config({ path: __dirname + "/../.env" });

const app = express();
const port = process.env.PORT || 3000;

// Enable CORS for Webflow origin
app.use(
  cors({
  origin: [
    'https://soul-box.webflow.io',
    'https://soulboxed.com',
    'https://www.soulboxed.com',
  ],
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  })
);

// Stripe webhooks need the raw body for signature checks, so this comes before express.json().
app.post("/api/stripe-webhook", express.raw({ type: "application/json" }), giftRoutes.stripeWebhook);

app.use(express.json({ limit: "200kb" }));
app.use("/api", giftRoutes.router);
app.use("/api", readerRoutes.router);
app.use("/api", apiRoutes);

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
  console.log("API_KEY:", process.env.WEBFLOW_API_KEY ? "****" : "not set");
  console.log(
    "COLLECTION_ID:",
    process.env.WEBFLOW_COLLECTION_ID || "undefined"
  );
});
