const mongoose  = require("mongoose")

const connectDB = async ()=>{
    await mongoose.connect(process.env.MongoDB_URI)

}


module.exports = connectDB;