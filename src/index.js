// require('dotenv').config({path:'./env'})
import dotenv from "dotenv"
import connectdb from "./db/db.js"
import app from "./app.js"

dotenv.config({
    path:'./env'
})

connectdb()
.then(()=>{
    const port = process.env.PORT || 8000;
    app.listen(port,()=>{
        console.log("SERVER STARTED ON PORT ",port);
    })
})
.catch((e)=>{console.log("MONDODB CONNECTION FAILED ",e);})