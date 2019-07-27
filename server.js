const cors = require("cors");
const next = require("next");

const express = require("express");
const bodyParser = require("body-parser");
const Cookies = require("universal-cookie-express");

const dev = process.env.NODE_ENV !== "production";
const port = process.env.PORT || 54163;

const app = next({ dev });
const handler = app.getRequestHandler();

const routerProfile = require("./backend/profile");
const routerVkApi = require("./backend/vkApi");

app
  .prepare()
  .then(() => {
    const server = express();

    server.use(cors());
    server.use(bodyParser.json());
    server.use(bodyParser.urlencoded({ extended: true }));
    server.use(Cookies());

    server.use(routerProfile);
    server.use(routerVkApi);

    server.get("*", (req, res) => {
      return handler(req, res);
    });

    server.listen(port, err => {
      if (err) throw err;
      console.log(`> Ready on http://localhost:${port}`);
    });
  })
  .catch(ex => {
    console.error(ex.stack);
    process.exit(1);
  });
