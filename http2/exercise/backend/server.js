import http2 from "http2";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import handler from "serve-handler";
import nanobuffer from "nanobuffer";

let connections = [];

const msg = new nanobuffer(50);
const getMsgs = () => Array.from(msg).reverse();

msg.push({
  user: "brian",
  text: "hi",
  time: Date.now(),
});

// the two commands you'll have to run in the root directory of the project are
// (not inside the backend folder)
//
// openssl req -new -newkey rsa:2048 -new -nodes -keyout key.pem -out csr.pem
// openssl x509 -req -days 365 -in csr.pem -signkey key.pem -out server.crt
//
// http2 only works over HTTPS
// starting server with cert and key
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const server = http2.createSecureServer({
  cert: fs.readFileSync(path.join(__dirname, "/../server.crt")),
  key: fs.readFileSync(path.join(__dirname, "/../key.pem")),
});

/*
 *
 * Code goes here
 *
 */
// stream assets only available in HTTP2
server.on("stream", (stream, headers) => {
  const path = headers[":path"];
  const method = headers[":method"];

  // streams open evert request from the browser
  if (path == "/msgs" && method === "GET") {
    // reply with 200 ok  and the encoding
    console.log("connected a stream " + stream.id);
    // JSON doesn't stream very well - multiple packets of json - can't stream json
    stream.respond({
      status: 200,
      "content-type": "text/plain; charset=utf-8",
    });

    // write first response
    stream.write(JSON.stringify({ msg: getMsgs() }));
    // push all streams into connections array
    connections.push(stream);

    stream.on("close", () => {
      console.log("disconnected " + stream.id);
      // connections will be only valid streams
      connections = connections.filter((s) => s !== stream);
    });
  }
});

// check path if not msgs send static assets, if method is post butter data into json
//  1.1 style request -
server.on("request", async (req, res) => {
  const path = req.headers[":path"];
  const method = req.headers[":method"];

  if (path !== "/msgs") {
    // handle the static assets
    return handler(req, res, {
      public: "./frontend",
    });
  } else if (method === "POST") {
    // get data out of post
    const buffers = [];
    for await (const chunk of req) {
      buffers.push(chunk);
    }
    const data = Buffer.concat(buffers).toString();
    const { user, text } = JSON.parse(data);
    msg.push({
      user,
      text,
      time: Date.now(),
    });
    res.end();

    connections.forEach((stream) => {
      stream.write(JSON.stringify({ msg: getMsgs() }));
    });
  }
});

// start listening
const port = process.env.PORT || 8080;
server.listen(port, () =>
  console.log(
    `Server running at https://localhost:${port} - make sure you're on httpS, not http`
  )
);
