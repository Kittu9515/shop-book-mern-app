const express = require('express')
const parser = require('body-parser')
const cors = require('cors')
const router = require('./routes/route.js')

const port = process.env.PORT|| "8888";
const app = express();

//Middlewares to parse data as json & allow all cross-origin resource sharing
app.use(parser.json());
app.use(cors());

//Filtering APIs & forwarding to router

app.use('/api',router);
app.use('*',(req,res)=>{
    res.status(404).json({
        message:`resource not found ${req.url}`
    })
})

// listening at ${port}
app.listen(port,() => {
    console.log(`server is running at port : ${port}`);
})
// app.listen(port);