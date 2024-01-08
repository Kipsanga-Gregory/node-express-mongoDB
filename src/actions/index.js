const mongo = require("../mongodb");
const constants = require("../utils/constants");

const createPost = async (req, res) => {
  try {
    const { userId, message } = req.body;
    if (!userId) return res.status(400).send("User id field required");
    if (!message) return res.status(400).send("messade field required");

    const user = await getUserById(userId);
    if (!user) {
      return res.status(400).send("User with provided id not found");
    }

    const postTemplate = {
      userId,
      message,
      likes: 0,
      created_At: new Date().toLocaleString(),
    };

    const createResult = await mongo.insertData(
      constants.collections.posts,
      postTemplate
    );

    if (!createResult) {
      res.status(500).send("Internal server error. Could not create post");
    }

    res.send({
      message: "Post created successfully",
      insertedId: createResult.insertedId,
    });
  } catch (error) {
    res.status(500).send("Internal server error");
  }
};

const getPost = async (req, res) => {
  try {
    const { postId } = req.query;

    if (!postId) return res.status(400).send("postId required");

    const post = await mongo.readData(constants.collections.posts, {
      _id: postId,
    });

    if (!post.length) {
      return res.status(400).send("No post matching given id found");
    }

    res.send({
      message: "success",
      data: post[0],
    });
  } catch (error) {
    console.log("[getPost]", error.message);
    res.status(500).send("Internal server error");
  }
};

const getUserById = async (userId) => {
  try {
    const user = await mongo.readData(constants.collections.users, {
      _id: userId,
    });
    if (!user[0]) {
      return false;
    }
    return user[0];
  } catch (error) {
    return false;
  }
};

const likePost = async (req, res) => {
  try {
    const { userId, postId } = req.body;

    if (!userId) return res.status(400).send("UserId required");
    if (!postId) return res.status(400).send("postId required");

    const user = await getUserById(userId);
    if (!user) {
      return res.status(400).send("User with provided id not found");
    }

    const currentPost = await mongo.readData(constants.collections.posts, {
      _id: postId,
    });

    if (!currentPost[0]) {
      return res.status(400).send("no post matching provided postId found");
    }

    const result = await mongo.updateData(
      constants.collections.posts,
      {
        _id: postId,
      },
      {
        likes: currentPost[0].likes + 1,
      }
    );

    res.send({
      message: "Post liked successfully",
    });

    trackLikes({
      postId,
      userId,
      created_At: new Date().toLocaleString(),
    });
  } catch (error) {
    return res.status(500).send("Internal server error");
  }
};

const trackLikes = async (likeData) => {
  try {
    const result = await mongo.insertData(
      constants.collections.trackLikes,
      likeData
    );
    if (result) {
      console.log("Like meta updated");
    }
    console.log();
  } catch (error) {}
};

module.exports = {
  createPost,
  getPost,
  likePost,
};
