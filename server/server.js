require('dotenv').config()
const app = require("./src/app");
const connectDB = require("./src/db/db");
const http = require("http")
const httpServer = http.createServer(app);
const {setUpSocket }= require("./src/service/socket.service")

connectDB();
setUpSocket(httpServer)

httpServer.listen(3000, async () => {
    console.log("Server is running on port 3000");
    console.log("Database connected");
});