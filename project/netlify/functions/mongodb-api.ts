import { Handler } from '@netlify/functions';
import { MongoClient } from 'mongodb';

const uri = process.env.VITE_MONGODB_URI;
const dbName = 'sahajsarkar';

const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const client = new MongoClient(uri!);
    await client.connect();
    const db = client.db(dbName);

    const { collection, operation, data } = JSON.parse(event.body || '{}');
    
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

    await client.close();

    return {
      statusCode: 200,
      body: JSON.stringify(result),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Database operation failed' }),
    };
  }
};

export { handler };