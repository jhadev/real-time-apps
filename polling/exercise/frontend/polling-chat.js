// BACKOFF & RETRY

// RETRY - if a request fails, keep trying until it resolves. Can resut in DDOSing yourself on large sites if site is experiencing server issues,
// BACKOFF - 500 => 500 try again at twice the interval 0, 3. 6, 12, 24 (exponential backoff) if multiple consecutive failures as success becomes for likely.
// some sites use retry button for user to request immediately, user won't stop clicking button, manual DDOS
// hinder button presses to avoid

const chat = document.getElementById("chat");
const msgs = document.getElementById("msgs");

// let's store all current messages here
let allChat = [];

// the interval to poll at in milliseconds
const INTERVAL = 3000;

// a submit listener on the form in the HTML
chat.addEventListener("submit", function (e) {
  e.preventDefault();
  postNewMsg(chat.elements.user.value, chat.elements.text.value);
  chat.elements.text.value = "";
});

async function postNewMsg(user, text) {
  // post to /poll a new message
  // write code here
  console.log(user);
  const data = {
    user,
    text,
  };

  const options = {
    method: "POST",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json",
    },
  };
  await fetch("/poll", options);
}

async function getNewMsgs() {
  // poll the server
  // write code here
  let json;
  try {
    // throws an error if it won't connect not 500
    const res = await fetch("/poll");
    json = await res.json();
    // handling done in one place
    if (res.status >= 400) {
      throw new Error("request did not succeed " + res.status);
    }

    allChat = json.msg;
    render();
    failedTries = 0;
  } catch (e) {
    console.error("polling error", e);
    failedTries++;
  }
}

function render() {
  // as long as allChat is holding all current messages, this will render them
  // into the ui. yes, it's inefficent. yes, it's fine for this example
  const html = allChat.map(({ user, text, time, id }) =>
    template(user, text, time, id)
  );
  msgs.innerHTML = html.join("\n");
}

// given a user and a msg, it returns an HTML string to render to the UI
const template = (user, msg) =>
  `<li class="collection-item"><span class="badge">${user}</span>${msg}</li>`;

// linear backoff
const BACKOFF = 5000;

// set to 0 to fetch all previous messages
let timeToMakeNextRequest = 0;
let failedTries = 0;
async function raftTimer(time) {
  if (timeToMakeNextRequest <= time) {
    console.log(time); //ms since it started running ~10ms since browser has started
    await getNewMsgs();
    // want to wait for getNewMsgs to finish
    // time can be an issue because
    // if success failedTries = 0 x INTERVAL 5000 = 0
    // do expontential here as well
    timeToMakeNextRequest = time + INTERVAL + failedTries + BACKOFF;
  }

  requestAnimationFrame(raftTimer);
}

// GETS CALLED A TON, DON"T USE COMPLEX LOGIC
// requestAnimationFrame executes when the main thread is idle
// setTimeout will pause everything else
requestAnimationFrame(raftTimer);

// eventually over time when using

// requestAnimationFrame should be called scheduleInTheFuture

// PRODUCT ADVICE - IF A USER REUQEST FAILS IMMEDIATELY TRY AGAIN
// WAIT A SHORT TIME AND TRY AGAIN
// IF 3 REQUESTS FAIL IN A ROW BACK OFF AGGRESSIVELY
