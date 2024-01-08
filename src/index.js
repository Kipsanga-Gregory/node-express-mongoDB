require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongo = require("./mongodb");
const routes = require("./routes");

const REQUIRED_COLLECTIONS = ["users", "posts", "trackLikes"];

(async () => {
  const app = express();

  app.use(cors());
  app.use(
    express.urlencoded({
      extended: true,
    })
  );
  app.use(express.json());

  await mongo.createMissingCollections(REQUIRED_COLLECTIONS);

  app.use("/api", routes);

  app.listen(3000, () => {
    console.log("App listening on port 3000");
  });
})();
