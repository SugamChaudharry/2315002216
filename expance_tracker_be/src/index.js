import express from "express";
import cors from "cors"
import expanceRouter from "./route.js"
import dotenv from "dotenv"

dotenv.config({path: "./.env"})

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

app.get("/", ()=>{
    console.log("...")
})
app.use("/expance", expanceRouter)


app.listen(PORT, ()=>{
    console.log("runing")
})