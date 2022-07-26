const express = require('express')
const parser = require('cookie-parser')
const cors = require('cors')
const router = require('./routes/route.js')
const fileupload = require("express-fileupload");

const port = process.env.PORT|| "5000";
const app = express();

//Middlewares to parse data as json & allow all cross-origin resource sharing
// app.use(fileupload());
app.use(parser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

//Filtering APIs & forwarding to router

app.use('/api',router);
app.use('*',(req,res)=>{
    res.status(404).json({
        message:`resource not found ${req.url}`
    })
})

if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'staging') {
    app.use(express.static('client/build'));
    app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname + '/client/build/index.html'));
    });
   }
// listening at ${port}
app.listen(port,() => {
    console.log(`server is running at port : ${port}`);
})
// app.listen(port);