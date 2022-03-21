const express = require("express");
const app = express();
const cors = require("cors");
const mongodb = require("mongodb");
const mongoClient = mongodb.MongoClient;
const bcryptjs = require("bcryptjs");
const jsonwebtoken = require("jsonwebtoken");

app.use(express.json());
app.use(
  cors({
    origin: "*",
  })
);
const URl =
  "mongodb+srv://suriya:suriya1998@cluster0.ppha5.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
let authenticate = (req, res, next) => {
  console.log(req.headers);
  if (req.headers.authorization) {
    let decoded = jsonwebtoken.verify(
      req.headers.authorization,
      "periyamragasiam"
    );
    if (decoded) {
      next();
    } else {
      res.status(401).json({ message: "incorect token" });
    }
  } else {
    res.status(401).json({ message: "not allowed" });
  }
};
app.post("/usercreate", async (req, res) => {
  try {
    //  STEP1: connect data base
    let connection = await mongoClient.connect(URl);
    //  STEP2: select db
    let db = connection.db("bajajdetails");
    //  STEP3: select collection and do operations
    await db.collection("bikedetails").insertOne(req.body);
    console.log(req.body);
    //  STEP4: close connections
    await connection.close();
    res.json({ message: "user created" });
  } catch (error) {
    console.log("createuser error", error);
    res.status(500).json({ message: "internal server error" });
  }
});

app.get("/userlist", authenticate, async (req, res) => {
  try {
    //  STEP1: connect data base
    let connection = await mongoClient.connect(URl);
    //  STEP2: select db
    let db = connection.db("bajajdetails");
    //  STEP3: select collection and do operations
    let usersdata = await db.collection("bikedetails").find().toArray();
    //  STEP4: close connections
    await connection.close();
    res.json(usersdata);
  } catch (error) {
    console.log("getdata error", error);
    res.status(500).json({ message: "internal server error" });
  }
});
// put method
app.get("/singleuser/:id", async (req, res) => {
  // for put method to get single username
  try {
    // STEP1: connect data base
    let connection = await mongoClient.connect(URl);
    //  STEP2: select db
    let db = connection.db("bajajdetails");
    //  STEP3: select collection and do operations
    let usersdata = await db
      .collection("bikedetails")
      .findOne({ _id: mongodb.ObjectId(req.params.id) });
    //  STEP4: close connections
    await connection.close();
    res.json(usersdata);
  } catch (error) {
    console.log("getdata error", error);
    res.status(500).json({ message: "internal server error" });
  }
});
app.put("/useredit/:id", async (req, res) => {
  try {
    //  STEP1: connect data base
    let connection = await mongoClient.connect(URl);
    //  STEP2: select db
    let db = connection.db("bajajdetails");
    //  STEP3: select collection and do operations
    await db
      .collection("bikedetails")
      .findOneAndUpdate(
        { _id: mongodb.ObjectId(req.params.id) },
        { $set: req.body }
      );
    //  STEP4: close connections
    await connection.close();
    res.json({ message: "user edited" });
    console.log(req.body);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "internal server error" });
  }
});

app.post("/register", async (req, res) => {
  // posting data to database
  try {
    //   connnect
    let connection = await mongoClient.connect(URl);
    // select collection
    let db = connection.db("bajajdetails");
    //   operation
    let emailexist = await db
      .collection("userdetails")
      .findOne({ email: req.body.email });
    if (emailexist) {
      return res.status(400).json({ message: "email already exist" });
    }
    //encrypt password generate salt and hash
    let salt = await bcryptjs.genSalt(10);
    let hash = await bcryptjs.hash(req.body.password, salt);
    req.body.password = hash;
    //save user in db with hased password
    await db.collection("userdetails").insertOne(req.body);
    console.log(req.body);
    //   close connection
    await connection.close();
    res.json({ message: "user created" });
  } catch (error) {
    console.log("createuser error", error);
    res.status(500).json({ message: "internal server error" });
  }
});

app.post("/login", async (req, res) => {
  // posting data to database
  try {
    //   connnect
    let connection = await mongoClient.connect(URl);
    // select collection
    let db = connection.db("bajajdetails");
    //   operation
    let user = await db
      .collection("userdetails")
      .findOne({ email: req.body.email });
    // email does not register
    if (user) {
      let compare = await bcryptjs.compare(req.body.password, user.password);
      //   comapre return boolean
      if (compare) {
        //   generate token
        let token = jsonwebtoken.sign({ id: user._id }, "periyamragasiam");
        res.json({ token });
      } else {
        res.status(401).json({ message: "password incorrect" });
      }
    } else {
      // email not found in db
      return res.status(400).json({ message: "email not registered" });
    }
    // close connection
    await connection.close();
  } catch (error) {
    res.status(500).json({ message: "internal server error" });
  }
});

app.delete("/delete/:id", async (req, res) => {
  try {
    //  STEP1: connect data base
    let connection = await mongoClient.connect(URl);
    //  STEP2: select db
    let db = connection.db("bajajdetails");
    //  STEP3: select collection and do operations
    await db
      .collection("bikedetails")
      .findOneAndDelete(
        { _id: mongodb.ObjectId(req.params.id) },
        { $set: req.body }
      );
    //  STEP4: close connections
    await connection.close();
    res.json({ message: "user deleted" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "internal server error" });
  }
});

app.listen(process.env.PORT || 5000);
