const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;
app.use(cors({
  origin: true,
  credentials: true,
}));
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@courivo.3sbtqpt.mongodb.net/?retryWrites=true&w=majority&appName=courivo`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();

    const db = client.db('courivoDB');
    const coursesCollection = db.collection('courses');
    const enrollmentsCollection = db.collection('enrollments');
    // GET all courses & GET by id
    app.get('/courses', async (req, res) => {
      const { category } = req.query;
      const filter = category ? { category } : {};
      const result = await coursesCollection.find(filter).toArray();
      res.send(result);
    });

    app.get('/courses/featured', async (req, res) => {
      const result = await coursesCollection.find({ isFeatured: true }).limit(6).toArray();
      res.send(result);
    });

    app.get('/courses/user/:email', async (req, res) => {
      const result = await coursesCollection.find({ ownerEmail: req.params.email }).toArray();
      res.send(result);
    });

    app.get('/courses/:id', async (req, res) => {
      const result = await coursesCollection.findOne({ _id: new ObjectId(req.params.id) });
      res.send(result);
    });
    // POST course with owner email
    app.post('/courses', async (req, res) => {
      const result = await coursesCollection.insertOne(req.body);
      res.send(result);
    });
    // PUT and DELETE course routes
    app.put('/courses/:id', async (req, res) => {
      const result = await coursesCollection.updateOne(
        { _id: new ObjectId(req.params.id) },
        { $set: req.body }
      );
      res.send(result);
    });

    app.delete('/courses/:id', async (req, res) => {
      const result = await coursesCollection.deleteOne({ _id: new ObjectId(req.params.id) });
      res.send(result);
    });
    // Enrollment routes - post and get by user email
    app.post('/enrollments', async (req, res) => {
      const result = await enrollmentsCollection.insertOne(req.body);
      res.send(result);
    });

    app.get('/enrollments/:email', async (req, res) => {
      const result = await enrollmentsCollection.find({ userEmail: req.params.email }).toArray();
      res.send(result);
    });

    app.get('/', (req, res) => res.send('Courivo server running'));

  } finally {}
}
app.listen(port, () => console.log(`Server running on port ${port}`));
run().catch(console.dir);