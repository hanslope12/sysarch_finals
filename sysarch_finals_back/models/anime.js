const mongoose = require("mongoose")

//connect to your mongodb database
mongoose.connect("mongodb://localhost:27017/MyFirstWebApp")
.then(() => {
    console.log("MONGODB CONNECTED")
})
.catch(() => {
    console.log("MONGODB FAILED TO CONNECTED")
})

//create a schema for the documents
const AnimeSchema = new mongoose.Schema({
    username : {
        type : String,
        required : true
    },
    password : {
        type : String,
        required : true
    }
})
const AnimeModel = mongoose.model("anime", AnimeSchema)
module.exports = AnimeModel