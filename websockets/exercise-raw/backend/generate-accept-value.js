import crypto from "crypto";

function generateAcceptValue(acceptKey) {
  return (
    crypto
      .createHash("sha1")
      // this magic string key is actually in the spec
      .update(acceptKey + "258EAFA5-E914-47DA-95CA-C5AB0DC85B11", "binary")
      .digest("base64")
  );
}
//send back a header with a SHA1 hash
// take the key the browser sends, adds the magic key, then put it back into base84 and send it back
// this is magic is how we know sockets are communicating with each other
// the magic key is hardcodeed in the websocket spec
export default generateAcceptValue;
