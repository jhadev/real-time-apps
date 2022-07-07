const chat = document.getElementById("chat");
const msgs = document.getElementById("msgs");
const presence = document.getElementById("presence-indicator");
let allChat = [];

// listen for events on the form
chat.addEventListener("submit", function (e) {
  e.preventDefault();
  postNewMsg(chat.elements.user.value, chat.elements.text.value);
  chat.elements.text.value = "";
});

async function postNewMsg(user, text) {
  const data = { user, text };
  ws.send(JSON.stringify(data));
  // sent as buffer frames
}
// browser api - ws protocol for websockets -
// protocols to deal on - json - passes to server to let it know what it is coming
// minimal config from client side
const ws = new WebSocket("ws://localhost:8080", ["json"]);
// on open run this function
ws.addEventListener("open", () => {
  console.log("connected");
  presence.innerText = "CONNECTED";
});

// accept message
ws.addEventListener("message", (e) => {
  // parse it
  const data = JSON.parse(e.data);
  // grab info you want
  allChat = data.msg;
  // call render
  render();
});

ws.addEventListener("close", () => {
  presence.innerText = "SOCKET CLOSED";
});

function render() {
  const html = allChat.map(({ user, text }) => template(user, text));
  msgs.innerHTML = html.join("\n");
}

const template = (user, msg) =>
  `<li class="collection-item"><span class="badge">${user}</span>${msg}</li>`;
