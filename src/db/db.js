import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectdb=async()=>{
    try {
        const connectionInstance=await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        console.log(`MONGODB CONNECTED !! DB HOST: ${connectionInstance.connection.host}`)
    } catch (error) {
        console.log(`DB CONNECTION FAILED : ${error}`);
        throw error;
    }
}

export default connectdb;