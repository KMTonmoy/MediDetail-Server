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
    const usersCollection = client.db("MediDetail").collection("users");

    app.get("/users", async (req, res) => {
      const users = await usersCollection.find().toArray();
      res.send(users);
    });

    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      const result = await usersCollection.findOne({ email });
      res.send(result);
    });

    app.patch("/users/:email", async (req, res) => {
      const { email } = req.params;
      const { role, ids, userEmail, userName } = req.body;

      const filter = { email: email };
      const updateDoc = {
        $set: {
          role,
          userEmail,
          userName,
        },
      };

      try {
        const result = await usersCollection.updateOne(filter, updateDoc);

        if (result.matchedCount === 0) {
          return res.status(404).send({ error: "User not found" });
        }

        if (result.modifiedCount === 0) {
          return res
            .status(400)
            .send({ message: "No changes made to the user" });
        }

        res.send({ message: "User updated successfully", result });
      } catch (error) {
        console.error(error);
        res.status(500).send({ error: "Failed to update user" });
      }
    });

    app.put("/user", async (req, res) => {
      const user = req.body;
      const query = { email: user?.email, name: user.displayName };
      const isExist = await usersCollection.findOne(query);
      if (isExist) {
        if (user.status === "Requested") {
          const result = await usersCollection.updateOne(query, {
            $set: { status: user?.status },
          });
          return res.send(result);
        } else {
          return res.send(isExist);
        }
      }

      const options = { upsert: true };
      const updateDoc = {
        $set: {
          ...user,
          timestamp: Date.now(),
        },
      };
      const result = await usersCollection.updateOne(query, updateDoc, options);
      res.send(result);
    });

    app.post("/users", async (req, res) => {
      const newUser = req.body;
      try {
        const existingUser = await usersCollection.findOne({
          email: newUser.email,
        });
        if (existingUser) {
          return res.status(400).send({ message: "User already exists" });
        }
        const result = await usersCollection.insertOne({
          ...newUser,
          timestamp: Date.now(),
          status: "Pending",
        });

        res.status(201).send({ message: "User created successfully", result });
      } catch (error) {
        console.error(error);
        res.status(500).send({ error: "Failed to create user" });
      }
    });





    app.post("/banners", async (req, res) => {
      const banner = req.body;

      if (!banner || !banner.image || !banner.title || !banner.text) {
        return res.status(400).send({ error: "Invalid banner data" });
      }

      try {
        const result = await bannerCollection.insertOne({
          image: banner.image,
          title: banner.title,
          text: banner.text,
          bgColor: banner.bgColor,
          timestamp: Date.now(),
        });
        res
          .status(201)
          .send({ message: "Banner uploaded successfully", result });
      } catch (error) {
        console.error("Error uploading banner:", error);
        res.status(500).send({ error: "Failed to upload banner" });
      }
    });

    app.get("/bannersFull", async (req, res) => {
      const banners = await bannerCollection.find().toArray();
      res.send(banners);
    });

    app.get("/banners/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const banner = await bannerCollection.findOne({
          _id: new ObjectId(id),
        });

        if (!banner) {
          return res.status(404).send({ message: "Banner not found" });
        }

        res.send(banner);
      } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Error retrieving banner" });
      }
    });

    app.patch("/banners/:id", async (req, res) => {
      const id = req.params.id;
      const updatedBanner = req.body;

      try {
        const result = await bannerCollection.updateOne(
          { _id: new ObjectId(id) },
          {
            $set: {
              image: updatedBanner.image,
              title: updatedBanner.title,
              text: updatedBanner.text,
              bgColor: updatedBanner.bgColor,
            },
          }
        );

        if (result.matchedCount === 0) {
          return res.status(404).send({ message: "Banner not found" });
        }

        res.send({ message: "Banner updated successfully", result });
      } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Error updating banner" });
      }
    });

    app.delete("/banners/:id", async (req, res) => {
      const id = req.params.id;

      try {
        const result = await bannerCollection.deleteOne({
          _id: new ObjectId(id),
        });

        if (result.deletedCount === 0) {
          return res.status(404).send({ message: "Banner not found" });
        }

        res.send({ message: "Banner deleted successfully" });
      } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Error deleting banner" });
      }
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

    app.get("/logout", async (req, res) => {
      try {
        res
          .clearCookie("token", {
            maxAge: 0,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
          })
          .send({ success: true });
      } catch (err) {
        res.status(500).send(err);
      }
    });

    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } finally {
    process.on("SIGINT", async () => { });
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("MediDetail is sitting");
});
