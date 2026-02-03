const express = require("express");
const authRouter = require("./routes/authRoute");
const postRoute = require("./routes/postRoute");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const app = express();

app.use(cors(
    {
        origin: "https://social-gilt-seven.vercel.app",
        methods: ["GET", "POST", "PUT", "DELETE"],
        credentials: true,

    }
))
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/auth", authRouter);
app.use("/", postRoute);

module.exports = app;
