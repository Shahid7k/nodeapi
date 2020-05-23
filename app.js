const express = require("express");
const app = express();
const mongoose = require("mongoose");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const cookieParser=require('cookie-parser')
// var cookieParser = require("cookie-parser");
const expressValidator = require("express-validator");
const cors=require('cors')

// const fs = require("fs");
// const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();




mongoose.connect(process.env.MONGO_URI,{useNewUrlParser:true}).then(()=>console.log("DB CONNECTED!"));

mongoose.connection.on("error",err=>console.log("DB ERROR!!",err.message))

const postRoutes = require("./routes/post");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const quesRoutes = require("./routes/ques");
// apiDocs
// app.get("/api", (req, res) => {
    //     fs.readFile("docs/apiDocs.json", (err, data) => {
//         if (err) {
//             res.status(400).json({
//                 error: err
//             });
//         }
//         const docs = JSON.parse(data);
//         res.json(docs);
//     });
// });

// middleware -
app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(expressValidator());
app.use(cors());
app.use("/", postRoutes);
app.use("/", authRoutes);
app.use("/", userRoutes);
app.use("/", quesRoutes);
app.use(function(err, req, res, next) {
    if (err.name === "UnauthorizedError") {
        res.status(401).json({ error: "Unauthorized!" });
    }
});

const port = 8080;
app.listen(port, () => {
    console.log(`A Node Js API is listening on port: ${port}`);
});
