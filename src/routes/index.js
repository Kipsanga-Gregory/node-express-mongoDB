const { Router } = require("express");
const actions = require("../actions");

const mainRouter = Router();

mainRouter.post("/message", actions.createPost);
mainRouter.get("/message", actions.getPost);
mainRouter.post("/message/like", actions.likePost);

module.exports = mainRouter;
