# Intro to Real Time
- polling
- backoff and retry
- http2
- raw-sockets
- socket.io

Finshed course - https://frontendmasters.com/courses/realtime/raw-websockets-setup/=
git 

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