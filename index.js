const express = require("express");
const app = express();
const cors = require("cors");

const port = process.env.PORT || 8000;

app.use(
  cors({
    origin: ["http://localhost:3000", "https://medi-detail-client.vercel.app"],
    credentials: true,
  })
);

app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri =
  "mongodb+srv://tonmoyahamed2009:MediDetail@cluster0.41yls.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    console.log("Connected to MongoDB");

    const medicinesCollection = client.db("MediDetail").collection("medicines");

    app.get("/users", async (req, res) => {
      const users = await usersCollection.find().toArray();
      res.send(users);
    });

    app.get("/medicines", async (req, res) => {
      const medicines = await medicinesCollection.find().toArray();
      res.send(medicines);
    });

    app.get("/medicines/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const ObjectId = require("mongodb").ObjectId;

        const medicine = await medicinesCollection.findOne({
          _id: new ObjectId(id),
        });

        if (!medicine) {
          return res.status(404).send({ message: "medicine not found" });
        }

        res.send(medicine);
      } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Error retrieving medicine" });
      }
    });

    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } finally {
    process.on("SIGINT", async () => {});
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("MediDetail is sitting");
});
