const express = require("express");
const path = require("path");
const fileRouter = require("./routes/filesRoute");
// const showRouter = require("./routes/showRoute");
require("dotenv").config();
const app = express();

const PORT = process.env.PORT;

const connection = require("./config/connection");
connection();

//setting up template engine
app.set("views", path.join(__dirname, "/views"));
app.set("view engine", "ejs");
 
app.use(express.static("public"));
app.use(express.json());

app.use("/files", fileRouter);
// app.use("/files", showRouter);

app.listen(PORT, () => {
  console.log(`Server listening on PORT: ${PORT}`);
});
