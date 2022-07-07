# Intro to Real Time
- polling
- backoff and retry
- http2
- raw-sockets - super interesting but extremely tedious

Finshed course - https://frontendmasters.com/courses/realtime/raw-websockets-setup/=
git 

https://btholt.github.io/complete-intro-to-realtime/

http 1.1 - 1 request - 1 response
http2 push leaves connection 
multiplexing - one big pipe connection so you don't have to make multiple handshakes
request prioritization
long running requests - feature of http2
- 1.1 has to wait for everything in HTML to finish 
- 2 immediatly push entire head, render in background, send data in chunks
- 3 something that can happen all at once could come in pieces.

1-2 changed interops protocols TCP/IP
TCP/IP head of line blocking - 100 packets, drop the 3rd packet, packets have to come in order.

http3 aka QUIC messes with transport layer. Packet sizing and send over UDP
way more fault resistant. send all packets doesn't matter what order they are in.
bad network speeds will benefit.

HTTP2 only works over SSL, need to set up local server to run over https

openssl req -new -newkey rsa:2048 -new -nodes -keyout key.pem -out csr.pem
openssl x509 -req -days 365 -in csr.pem -signkey key.pem -out server.crt

nanobuffer/serverhandler from Vercel
No Express

Each folder has it's own project.

Truest realtime - WEBSOCKETS BIDIRECTIONAL

polling is very close to real time because you are polling endpoint 
http2 is polling endpoint in one direction - pushing from server to client
websockets not every server can handle it

Websocket is a primitive, another thing that you can do in the browser that connects to special kind of connection, still connects over TCP/IP

Raw sockets creating connections by hand - BAD IDEA but very fun
Native browser API on client side, but on the backend theres ALOT to deal with.

Web sockets connect via TCP/IP so via HTTP will make a connection to your server to some endpoint
Hey endpoint we want to upgrade this connection, up to server to say what does upgrading mean? send upgrade request, server says cool I know how to speak websocket and then it will connnect.
Do not have to do any of this on the client. Node needs manual config or library to handle websockets.

Using raw websockets -
Have to directly manipulate binary sent to client - websockets/exercise-raw/backend/obj-to-response.js
Extremely tedious - socket.io and ws are doing this for you in the library.
Very easy to do from client side
