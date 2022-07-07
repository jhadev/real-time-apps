export default function objToResponse(obj) {
  // stringify object
  const string = JSON.stringify(obj);
  // how many bytes is this string
  const stringBytes = Buffer.byteLength(string);
  // we're only doing two frames
  // count length of byte count
  // frame = one packet of data is called a frame
  const lengthByteCount = stringBytes < 126 ? 0 : 2;
  const payloadLength = lengthByteCount === 0 ? stringBytes : 126;
  // create buffer to write to
  const buffer = Buffer.alloc(2 + lengthByteCount + stringBytes);
  // 0b10000001 is binary number in JS
  buffer.writeUInt8(0b10000001, 0);
  // write how long buffer will be
  buffer.writeUInt8(payloadLength, 1);

  let payloadOffset = 2;
  if (lengthByteCount > 0) {
    // write all info to buffer in binary
    buffer.writeUInt16BE(stringBytes, 2);
    payloadOffset += lengthByteCount;
  }
  // write to buffer (encoded message)
  buffer.write(string, payloadOffset);
  return buffer;
}
