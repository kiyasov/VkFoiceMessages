const easyvk = require("easyvk");
const express = require("express");
const multipart = require("connect-multiparty");

const { sendMessage, formatData } = require("./messages");

const app = express.Router();

const upload = multipart();

app.post("/api/v1/method", upload, async (req, res) => {
  const { body } = req;

  try {
    let vk = await easyvk({
      access_token: req.universalCookies.get("access_token")
    });

    switch (body.methodName) {
      case "messages.getConversations":
        return res.json(await formatData({ vk, req }));
      case "messages.send":
        return res.json(await sendMessage({ vk, req }));
      default: {
        let { vkr } = await vk.call(body.methodName, body.props);
        return res.json(vkr);
      }
    }
  } catch (error) {
    return res
      .status(500)
      .json({ status: "error", data: error.message, props: error });
  }
});

module.exports = app;
