const express = require('express');
const mongoose = require('mongoose');
const cors  = require('cors');
const AnimeModel = require('./models/anime')

const app = express()
app.use(cors())
app.use(express.json())
mongoose.connect("mongodb://localhost:27017/MyFirstWebApp")//insert database name at the end of "27017/"

app.get('/getAnimes', (req, res)=>{
    AnimeModel.find()
    .then(anime => res.json(anime))
    .catch(err => res.json(err))
    
})
app.listen(3001, ()=> {
    console.log("server is running")
})


/*
priority list, backend
1. Mongodb, kaggle dataset, display basic data, animeid, anime name and anime rank
2. Jikan, jikan api data, display basic data, animeid, anime name and anime rank
3. Compare mongodb and jikan data, display.

front-end
1.Get post request from backend
*/