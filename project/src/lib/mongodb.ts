const BASE_URL = `https://data.mongodb-api.com/app/${import.meta.env.VITE_MONGODB_APP_ID}/endpoint/data/v1`;
const API_KEY = import.meta.env.VITE_MONGODB_API_KEY;
const DATA_SOURCE = 'sahajsarkar';
const DATABASE = 'sahajsarkar';

export const mongodb = {
  collection: (collectionName: string) => ({
    findOne: async (filter: any) => {
      const response = await fetch(`${BASE_URL}/action/findOne`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': API_KEY,
        },
        body: JSON.stringify({
          dataSource: DATA_SOURCE,
          database: DATABASE,
          collection: collectionName,
          filter
        }),
      });
      const data = await response.json();
      return data.document;
    },

    insertOne: async (document: any) => {
      const response = await fetch(`${BASE_URL}/action/insertOne`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': API_KEY,
        },
        body: JSON.stringify({
          dataSource: DATA_SOURCE,
          database: DATABASE,
          collection: collectionName,
          document
        }),
      });
      return response.json();
    },

    findOneAndUpdate: async (filter: any, update: any, options: any = {}) => {
      const response = await fetch(`${BASE_URL}/action/findOneAndUpdate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': API_KEY,
        },
        body: JSON.stringify({
          dataSource: DATA_SOURCE,
          database: DATABASE,
          collection: collectionName,
          filter,
          update,
          options
        }),
      });
      return response.json();
    },

    aggregate: async (pipeline: any[]) => {
      const response = await fetch(`${BASE_URL}/action/aggregate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': API_KEY,
        },
        body: JSON.stringify({
          dataSource: DATA_SOURCE,
          database: DATABASE,
          collection: collectionName,
          pipeline
        }),
      });
      const data = await response.json();
      return data.documents;
    }
  })
};