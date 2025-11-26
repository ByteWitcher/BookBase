import express from "express";

export class Server {
  listen(port = 3000) {
    const app = express();

    app.get("/", (req, res) => {
      res.send("Hello World!");
    });

    app.listen(port, () => {
      console.log(`Example app listening on port ${port}`);
    });
  }
}

export default Server;
