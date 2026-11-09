require("dotenv").config();


const express  = require("express");
const app = express()
const cors = require("cors");



app.use(express.json())
app.use(cors({
    origin : ""
}))

//load the routes which is in the controller
const soilRoute = require("./Routes/soildRoute.route");
app.use("/soil" , soilRoute);





const PORT = process.env.PORT ?? Number(3000);

app.get("/" , (req , res) => {
    return res.status(200).json({
        message : "Soil Moistuer Up And Running",
        status : "ON"
    })
})



app.listen(PORT , "0.0.0.0" , (error) => {
    if(error) {
     throw new Error("Connection error on the server listening" , error)
    }
    console.log("Server is hoisted on the network level IP PORT of " ,PORT )
})
