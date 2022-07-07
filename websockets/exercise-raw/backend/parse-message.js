function parseMessage(buffer) {
  // takes in buffer and translates it back into text
  // ex: <Buffer 81 9f fc 8a 6d 8e 87 a8 18 fd 99 f8 4f b4 de f9 0b ea 9a f9 4f a2 de fe 08 f6 88 a8 57 ac 99 f8 1f eb 88 a8 10>
  // read firstByte
  const firstByte = buffer.readUInt8(0);
  // logical & bitwise operator -
  const opCode = firstByte & 0xf; // hexademical 16
  /* 
  0b10010011 & 0b00010010
  product of these would be
  0b000100010 
  */

  if (opCode === 8) {
    // connection closed
    return null;
  }
  if (opCode !== 1) {
    // we only care about text frames
    return;
  }
  // only care about text frames which is opCode 1

  const secondByte = buffer.readUInt8(1);
  const isMasked = secondByte >>> 7 === 1;
  // we should only be seeing masked frames from the browser
  if (!isMasked) {
    throw new Error("we only care about masked frames from the browser");
  }

  const maskingKey = buffer.readUInt32BE(2);
  let currentOffset = 6;

  const messageLength = secondByte & 0x7f;
  if (messageLength > 125) {
    throw new Error("lol we're not doing big frames");
  }

  // getting all of the bytes together for the string
  // then we'll convert it to a utf8 string
  const response = Buffer.alloc(messageLength);
  for (let i = 0; i < messageLength; i++) {
    // applying the mask to get the correct byte out
    const maskPosition = i % 4;

    let shift;
    if (maskPosition === 3) {
      shift = 0;
    } else {
      shift = (3 - maskPosition) << 3;
    }

    let mask;
    if (shift === 0) {
      mask = maskingKey & 0xff;
    } else {
      mask = (maskingKey >>> shift) & 0xff;
    }

    const source = buffer.readUInt8(currentOffset);
    currentOffset++;
    response.writeUInt8(mask ^ source, i);
  }
  // end up with object with end up with from websocket
  return JSON.parse(response.toString("utf8"));
}

export default parseMessage;
