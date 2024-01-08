const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.qeyrh4r.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

client
  .connect()
  .then(() => {
    console.log("MongoDb connected successfully");
  })
  .catch((err) => {
    console.log("Mongo connecton failed: ", err);
  });

const db = client.db(process.env.DB_NAME);

const createMissingCollections = async (required_collections) => {
  try {
    console.log("Creating missing collections");
    for (const collectionName of required_collections) {
      // Check if collection already exists
      const collections = await db
        .listCollections({
          name: collectionName,
        })
        .toArray();

      if (!collections.length) {
        console.log("Creating collection: ", collectionName);
        await db.createCollection(collectionName);
      }
    }
    console.log("Done creating missing collection");
    return;
  } catch (error) {
    console.log("[createMissingCollections]: ", error.message);
    throw new Error("Error creating missing collection");
  }
};

const insertData = async (collectionName, data) => {
  try {
    const selectedCollection = db.collection(collectionName);

    const result = await selectedCollection.insertOne(data);

    return result;
  } catch (error) {
    console.log("[insertData]", error.message);
    return false;
  }
};

const readData = async (collectionName, query) => {
  try {
    const selectedCollection = db.collection(collectionName);

    if (query._id) {
      query._id = new ObjectId(query._id);
    }

    const result = await selectedCollection.find(query).toArray();

    return result;
  } catch (error) {
    console.log("[readData]", error.message);
    return [];
  }
};

const updateData = async (collectionName, query, update) => {
  try {
    const selectedCollection = db.collection(collectionName);

    if (query._id) {
      query._id = new ObjectId(query._id);
    }
    const updateResult = await selectedCollection.updateOne(query, {
      $set: update,
    });
    return true;
  } catch (error) {
    return false;
  }
};

module.exports = {
  db,
  createMissingCollections,
  insertData,
  readData,
  updateData,
};
