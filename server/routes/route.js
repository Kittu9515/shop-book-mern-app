const express = require('express');
const mongodb = require('mongodb').MongoClient;
const  ObjectId = require('mongodb').ObjectId;
const fs = require('fs');

const route = express();
const database = "shopbook";
const productTable = "product";
const customerTable = "customer";

var url = "mongodb://localhost:27017/"+database;
// var db;

mongodb.connect(process.env.MONGODB_URI || url,(err,dbo)=>{
    if(err)
    {
        console.log(`Failed to connect MongoDB ${err}`);
        throw err;
    }
     db = dbo.db(database);
})

var multer = require('multer');
  
var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads')
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname +".png")
    }
});
  
let upload = multer({ storage: storage}).single('image');

//dummy API
route.get('/',(req,res)=>{
    res.status(200).json({
        success:true
    });
})

//Products APIs
route.get('/products',(req,res)=>{
    db.collection(productTable).find().toArray(function(err, result) {
        if (err) throw err;
        console.log(result);
        res.status(200).json({
            success:true,
            products:result
        });
    });
})

route.post('/product',(req,res)=>{
    //mongo connection and insert
    console.log(req)
    const product = {
        name:req.body.name,
        price:parseInt(req.body.price),
        quantity:parseInt(req.body.quantity)
    }
    db.collection(productTable).insertOne(product,(err,data)=>{
        if(err)
            throw err;
        console.log(data);
        res.status(200).json({
            success:true,
            product:data
        });
    })
})

route.put('/product/:id',(req,res)=>{
    //mongo connection and update
    console.log(req.params);
    console.log(req.body);
    const product = {
        name:req.body.name,
        price:req.body.price,
        quantity:req.body.quantity
    }
    db.collection(productTable).updateOne({ _id:ObjectId(req.params.id)},{$set: product},(err,data)=>{
        if(err)
            throw err;
        console.log(data);
        res.status(200).json({
            success:true,
            products:data
        });
    })
})

route.delete('/product/:id',(req,res)=>{
    //mongo connection and delete
    console.log(`Got request to delete ${req.params.id}`);
    db.collection(productTable).deleteOne({ _id:ObjectId(req.params.id)},(err,data)=>{
        if(err)
            throw err;
        console.log(data);
        res.status(200).json({
            success:true,
            products:data
        });
    })
})


//Customer APIs
route.get('/customers',(req,res)=>{
    filenames = fs.readdirSync("./uploads");
  
    console.log("\nCurrent filenames in directory:");
    console.log(`Got request to get customers`);
    db.collection(customerTable).find().toArray(function(err, result) {
        if (err) throw err;
        console.log(result);
        result.map((customer)=>{
            filenames.forEach((file) => {
                if(file.includes(customer.name))
                    customer.image = fs.readFileSync("./uploads/"+file);//.toString('base64');
            });
         });
         console.log(result);
        res.status(200).json({
            success:true,
            customers:result
        });
    });
})

route.post('/customer',(req,res)=>{
    console.log(req.file);
    upload(req,res,err=>{
        if(err){
            console.log("error in uploading..")
            console.log(err);
        }
        else{
        console.log('uploaded successfully');
        console.log(req.file);
        console.log(req.body);
         //mongo connection and insert
        console.log(`Got request to add ${req.body.name}`);
        const customer = {
            name:req.body.name,
            amount:parseInt(req.body.amount),
            transactions:req.body.transactions,
        }
        db.collection(customerTable).insertOne(customer,(err,data)=>{
            if(err)
                throw err;
            console.log(data);
            res.status(200).json({
                success:true,
                customer:data
            });
        })
    }
    })
})

route.put('/customer/:id',(req,res)=>{
    upload(req,res,err=>{
        if(err){
            console.log("error in uploading..")
            console.log(err);
        }
        else{
        console.log('uploaded successfully');
        //mongo connection and update
        console.log(req.files);
        console.log(`Got request to update ${req.body.name}`);
        console.log(req.body);
        const customer = {
            name:req.body.name,
            amount:req.body.amount,
            transactions:req.body.transactions
        }
        db.collection(customerTable).updateOne({ _id:ObjectId(req.params.id)},{$set: customer},(err,data)=>{
            if(err)
                throw err;
            console.log(data);
            res.status(200).json({
                success:true,
                customer:data
            });
        })
        }
    })
})

route.delete('/customer/:id',(req,res)=>{
    //mongo connection and delete
    console.log(`Got request to delete ${req.params.id}`);
    db.collection(customerTable).deleteOne({ _id:ObjectId(req.params.id)},(err,data)=>{
        if(err)
            throw err;
        console.log(data);
        res.status(200).json({
            success:true,
            customer:data
        });
    })
})

// //deleteAll only for DB usage
// route.delete('/customers',(req,res)=>{
//     //mongo connection and delete
//     console.log(`Got request to delete ${req.params.id}`);
//     db.collection(customerTable).deleteMany({ _id:ObjectId(req.params.id)},(err,data)=>{
//         if(err)
//             throw err;
//         console.log(data);
//         res.status(200).json({
//             success:true,
//             customer:data
//         });
//     })
// })

module.exports = route;