const easyvk = require("easyvk");
const express = require("express");

const app = express.Router();

app.post("/api/v1/authProfile", async (req, res) => {
  const { body } = req;

  try {
    let user = await easyvk({
      username: req.universalCookies.get("username"),
      password: req.universalCookies.get("password"),
      [body.code ? "code" : "2fa_supported"]: body.code || 1
    });

    req.universalCookies.set("access_token", user.session.access_token);

    return res.json(user.session);
  } catch (error) {
    return res
      .status(500)
      .json({ status: "error", data: error.message, props: error });
  }
});

app.post("/api/v1/getProfile", async (req, res) => {
  try {
    let user = await easyvk({
      access_token: req.universalCookies.get("access_token")
    });

    return res.json(user.session);
  } catch (error) {
    return res
      .status(500)
      .json({ status: "error", data: error.message, props: error });
  }
});

module.exports = app;
