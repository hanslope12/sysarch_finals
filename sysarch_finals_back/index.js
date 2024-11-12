const express = require('express');
const mongoose = require('mongoose');
const cors  = require('cors');
const AnimeModel = require('./models/anime')

const app = express()
app.use(cors())
app.use(express.json())
mongoose.connect("mongodb://localhost:27017/")//insert database name at the end of "27017/"

app.get('/getAnimes', (req, res)=>{
    AnimeModel.find()
    .then(anime => res.json(anime))
    .catch(err => res.json(err))
})
app.listen(3001, ()=> {
    console.log("server is running")
})