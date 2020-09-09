// importing
import express from "express";
import mongoose from "mongoose";
import Messages from "./dbMessages.js";
import Pusher from "pusher";
import cors from "cors";
// app config
const app = express();
const port = process.env.PORT || 9000;

const pusher = new Pusher({
  appId: "1068162",
  key: "7cdc45f55bb23355a2aa",
  secret: "479a7ca588630d67a1f5",
  cluster: "ap1",
  encrypted: true,
});
// middleware
app.use(express.json());
app.use(cors());
if (process.env.NODE_ENV === "production") {
  app.use(express.static("whatsapp-mern/build"));
}
//using the above code will allow you to read the json file in postman, otherwise it would just return the id!
// DB Config
const connection_url =
  "mongodb+srv://admin:1uOBoTo0oFkl338q@cluster0.k36nl.mongodb.net/whatsappdb?retryWrites=true&w=majority";
mongoose.connect(process.env.MONGODB_URI || connection_url, {
  useCreateIndex: true,
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.once("open", () => {
  console.log("DB is connected");

  const msgCollection = db.collection("messagecontents"); //from dbmessage.js
  const changeStream = msgCollection.watch(); //which one is the server watching
  changeStream.on("change", (change) => {
    console.log("A change occured", change); //whenever a change occur, save to the change variable
    if (change.operationType === "insert") {
      //If the operation type is insert
      const messageDetails = change.fullDocument;
      pusher.trigger("messages", "inserted", {
        //Insert this two stuff
        name: messageDetails.name,
        message: messageDetails.message,
        timestamp: messageDetails.timestamp,
        received: messageDetails.received,
      });
    } else {
      //if this is not working
      console.log("Error triggering pusher");
    }
  });
});

// API routes
app.get("/", (req, res) => res.status(200).send("hello world"));

app.get("/messages/sync", (req, res) => {
  Messages.find((err, data) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(200).send(data);
    }
  });
});
//the code above will get the data from database
app.post("/messages/new", (req, res) => {
  const dbMessage = req.body;
  Messages.create(dbMessage, (err, data) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(201).send(data);
    }
  });
});
//the code above will post the data to the database
// Listener
app.listen(port, () => console.log(`Listening on localhost:${port}`));
//1uOBoTo0oFkl338q
