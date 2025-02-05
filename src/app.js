import express, { urlencoded } from "express"
import cookieParser from "cookie-parser"
import cors from "cors"


const app = express()
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials:true
}))
app.use(express.json({limit:"16mb"}))
app.use(express.urlencoded({extended:true,limit:"16mb"}))
app.use(express.static("public"))
app.use(cookieParser())


//routes import
import userRouter from "./routes/user.router.js"

app.use("/api/v1/user",userRouter)


export default app