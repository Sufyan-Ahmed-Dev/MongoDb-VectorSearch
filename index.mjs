import express from "express";
import cors from "cors";
import path from "path";
import { MongoClient, ObjectId } from "mongodb";
import OpenAI from "openai";
const __dirname = path.resolve();
import { config } from "dotenv";
config();
const BaseURL = "http://localhost:8080";
const app = express();
const PORT = process.env.PORT || 8080;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const mongodbURI = process.env.DB_URL;
const client = new MongoClient(mongodbURI);
const database = client.db("SocialStories");
const postCollection = database.collection("posts");

async function run() {
  try {
    await client.connect();
    await client.db("Socialstories").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.use(express.json());
app.use(cors());
app.get(express.static(path.join(__dirname, "./client/dist")));
app.use("/", express.static(path.join(__dirname, "./client/dist")));

// Create a product
app.post(`/api/v1/postStory`, async (req, res) => {
  console.log(req.body);
  console.log("Stories created function");
  try {
    const { title, body } = req.body;
    if (!title || title.trim() === "") {
      return handleError(res, 400, "title name is required");
    }

    const product = { title, body };
    const result = await postCollection.insertOne(product);

    res.status(201).json(result)
   
  } catch (error) {
    console.error(error);
    
  }
});

// Get all products
app.get("/api/v1/allpost", async (req, res) => {
  const products = postCollection.find({}).sort({ _id: -1 }).project({ plot_embedding: 0 });
  // console.log(products)

  try {
    const allproducts = await products.toArray();
    // console.log(allproducts);
    res.send(allproducts);
  } catch (error) {
    console.log(error.message);
    handleError(res, 500, "Failed to get products");
  }
});

app.put("/api/v1/story/:id", async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) {
    res.status(403).send({ message: "incorrect product id" });
    return;
  }

  let story = {};

  if (req.body.title) story.title = req.body.title;
  if (req.body.body) story.body = req.body.body;

  try {
    const updateResponse = await postCollection.updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: story }
    );

    console.log("Product updated: ", updateResponse);

    res.send({
      message: "story updated successfully",
    });
  } catch (error) {
    console.log("error", error);
    res
      .status(500)
      .send({ message: "failed to update story, please try later" });
  }
});

app.delete("/api/v1/story/:id", async (req, res) => {
  try {
    const deleteResponse = await postCollection.deleteOne({
      _id: new ObjectId(req.params.id),
    });
    console.log("Story deleted: ", deleteResponse);
    console.log("deleteResponse: ", deleteResponse);

    res.send({
      message: "story deleted successfully",
    });
  } catch (e) {
    console.log("error: ", e);
    res.status(500).send({
      message: "failed to create story, please try later",
    });
  }
});

app.get("/api/v1/search", async (req, res) => {
  const queryText = req.query.q;

  const response = await openai.embeddings.create({
    model: "text-embedding-ada-002",
    input: queryText,
  });
  const vector = response?.data[0]?.embedding;
  console.log("vector: ", vector);
  // [ 0.0023063174, -0.009358601, 0.01578391, ... , 0.01678391, ]

 
  const documents = await postCollection.aggregate([
    {
      "$search": {
        "index": "default",
        "knnBeta": {
          "vector": vector,
          "path": "plot_embedding",
          "k": 10
        },
        "scoreDetails": true
      }
    },
    {
      "$project": {
        "plot_embedding": 0,
        "score": { "$meta": "searchScore" },
        "scoreDetails": { "$meta": "searchScoreDetails" }
      },

    }
  ]).toArray();


  res.send(documents)

});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
});

app.use("/", express.static(path.join(__dirname, "./client/build")));
