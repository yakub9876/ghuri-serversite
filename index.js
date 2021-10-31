const express = require("express");
const { MongoClient } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;
const cors = require("cors");
require("dotenv").config();
const app = express();
const port = 5000;

//middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.6mc02.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();
    const database = client.db("ghuriServices");
    const serviceCollection = database.collection("services");
    const bookingCollection = database.collection("booking");

    //GET  API
    app.get("/services", async (req, res) => {
      const cursor = serviceCollection.find({});
      const services = await cursor.toArray();
      res.send(services);
    });

    //GET API for my orders
    app.get("/myorder/:email", async (req, res) => {
      const email = req.params.email;
      console.log(email);
      const query = { email: email };
      const cursor = await bookingCollection.find(query).toArray();
      res.json(cursor);
    });

    //GET API for my orders
    app.get("/myorder", async (req, res) => {
      const cursor = await bookingCollection.find({}).toArray();
      res.json(cursor);
    });

    // DELETE API
    app.delete("/myorderdelete/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      console.log(query);
      const result = await bookingCollection.deleteOne(query);
      res.json(result);
    });

    //POST API for adding services
    app.post("/services", async (req, res) => {
      const service = req.body;
      const result = await serviceCollection.insertOne(service);
      console.log("data inserted", service);
      res.json(result);
    });

    //POST API for user information
    app.post("/booking", async (req, res) => {
      const booking = req.body;
      console.log(booking);
      const query = { serviceId: booking.service._id, email: booking.email };
      const findData = await bookingCollection.findOne(query);

      if (findData) {
        res.json("Already Booking");
      } else {
        const result = await bookingCollection.insertOne(booking);
        res.json(result);
      }
    });
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
