import express from 'express';
import { MongoClient } from 'mongodb';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

const uri = process.env.VITE_MONGODB_URI;
const client = new MongoClient(uri!);

app.post('/api/mongodb', async (req, res) => {
  try {
    await client.connect();
    const db = client.db('sahajsarkar');
    const { collection, operation, data } = req.body;
    
    let result;
    switch (operation) {
      case 'findOne':
        result = await db.collection(collection).findOne(data.query);
        break;
      case 'insertOne':
        result = await db.collection(collection).insertOne(data);
        break;
      case 'updateOne':
        result = await db.collection(collection).updateOne(
          data.query,
          data.update
        );
        break;
      case 'findOneAndUpdate':
        result = await db.collection(collection).findOneAndUpdate(
          data.query,
          data.update,
          data.options || {}
        );
        break;
      case 'aggregate':
        result = await db.collection(collection)
          .aggregate(data.pipeline)
          .toArray();
        break;
      default:
        throw new Error('Invalid operation');
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Database operation failed' });
  }
});

// Add this route to your existing dev server
app.post('/verify-turnstile', (req, res) => {
  // In development, always verify
  res.json({ verified: true });
});

app.listen(port, () => {
  console.log(`Dev server running at http://localhost:${port}`);
});