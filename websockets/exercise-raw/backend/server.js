import http from "http";
// could do this over http2
import handler from "serve-handler";
import nanobuffer from "nanobuffer";

// these are helpers to help you deal with the binary data that websockets use
import objToResponse from "./obj-to-response.js";
import generateAcceptValue from "./generate-accept-value.js";
import parseMessage from "./parse-message.js";

let connections = [];
const msg = new nanobuffer(50);
const getMsgs = () => Array.from(msg).reverse();

msg.push({
  user: "brian",
  text: "hi",
  time: Date.now(),
});

// serve static assets
const server = http.createServer((request, response) => {
  return handler(request, response, {
    public: "./frontend",
  });
});

// magical ritual now we client and server can speak to each other
// other upgrades you can use?
server.on("upgrade", (req, socket) => {
  // we only speak websocket here
  if (req.headers["upgrade"] !== "websocket") {
    socket.end("HTTP/1.1 400 Bad Request");
    return;
  }
  // not for security, just making sure both parties are speaking the same protocol
  const acceptKey = req.headers["sec-websocket-key"];
  const acceptValue = generateAcceptValue(acceptKey);
  // generate headers to send back to client
  // we are speaking json like we configured on client side
  const headers = [
    "HTTP/1.1 101 Web Socket Protocol Handshake",
    "Upgrade: WebSocket",
    "Connection: Upgrade",
    `Sec-WebSocket-Accept: ${acceptValue}`,
    "Sec-WebSocket-Protocol: json",
    "\r\n",
  ];
  // last line is whitespace to separate headers from data

  // done sending headers
  socket.write(headers.join("\r\n"));
  // send message down to client
  socket.write(objToResponse({ msg: getMsgs() }));
  connections.push(socket);

  socket.on("data", (buffer) => {
    const message = parseMessage(buffer);

    if (message) {
      msg.push({
        user: message.user,
        text: message.text,
        time: Date.now(),
      });

      connections.forEach((socket) => {
        socket.write(objToResponse({ msg: getMsgs() }));
      });
    } else if (message === null) {
      socket.end();
    }
  });

  socket.on("end", () => {
    connections = connections.filter((s) => s !== socket);
  });
});

const port = process.env.PORT || 8080;
server.listen(port, () =>
  console.log(`Server running at http://localhost:${port}`)
);
