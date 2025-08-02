const express = require('express')
const cors = require('cors')
const app = express()
const port = process.env.PORT || 3000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

//middleware
app.use(cors());
app.use(express.json())



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.r6nxx1r.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const foodsCollection = client.db("foodDB").collection("foods");

    // foods api
    app.get('/foods',async(req,res)=>{
      const result=await foodsCollection.find().toArray();
      res.send(result)
    })

    app.get('/availableFoods', async (req, res) => {
      const result = await foodsCollection
        .find({ status: 'available' })
        .toArray();
      res.send(result);
    })

    app.get('/foodsDetails/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await foodsCollection.findOne(query);
      res.send(result);
    })

    //featured foods according quantity 
    app.get('/featuredFoods', async (req, res) => {
      const featured = await foodsCollection
        .find({ status: 'available' })
        .sort({ quantity: -1 })
        .limit(6)
        .toArray();
      res.send(featured);
    })

    app.post('/addFoods',async(req,res)=>{
      const newFood=req.body;
      console.log(newFood);
      const result=await foodsCollection.insertOne(newFood);
      res.send(result)
      
    })

    app.delete('/foods/:id',async(req,res)=>{
      const id=req.params.id;
      const query={_id:new ObjectId (id)};
      const result=await foodsCollection.deleteOne(query);
      res.send(result);
    })



    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('Food is coming!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
