require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./db/connectDB");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const errorMiddleware = require("./middlewares/errors");
const booksRoutes = require("./routes/booksRoute");
const authRoutes = require("./routes/authRoute");
const orderRoutes = require("./routes/orderRoute");
const payment = require("./routes/payment");
const cloudinary = require("cloudinary");
const fileUpload = require("express-fileupload");
const path = require("path");

const PORT = process.env.PORT || 4000;

const app = express();

//handle uncaught exception
process.on("uncaughtException", (err) => {
  console.log(`Error: ${err.stack}`);
  console.log("Shutting down the server due to uncaught exception");
  process.exit(1);
});

//middlewares
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "http://localhost:5000");
  res.header("Access-Control-Allow-Credentials", true);
  res.header(
    "Access-Control-Allow-Headers",
    "Origin , X-Requested-with, Content-Type, Accept"
  );
  next();
});
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use(cookieParser());
app.use(fileUpload());

//setting up cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

//routes
app.use("/api/v1", booksRoutes);
app.use("/api/v1", authRoutes);
app.use("/api/v1", orderRoutes);
app.use("/api/v1", payment);

//error handleer middleware
app.use(errorMiddleware);

//serve static assets
if (
  process.env.NODE_ENV === "PRODUCTION" ||
  process.env.NODE_ENV == "staging"
) {
  app.use(express.static("client/build"));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname + "/client/build/index.html"));
  });
}
//starting the server
const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    app.listen(PORT, () =>
      console.log(
        `SERVER LISTENING ON PORT: ${PORT} in ${process.env.NODE_ENV} mode`
      )
    );
  } catch (error) {
    console.log(error.message);
    console.log("Shutting down the server due to unhandled promise rejection");
    process.exit(1);
  }
};
start();
