// Global States (oops)
var first_visit = true;
// Apparently javascript doesn't have a native enum type?
var ceo_mode = "TRADITIONAL";

const PEASANT_IMAGE = "assets/peasant.jpg";
const CEO_IMAGE = "assets/ceo.jpg";
// TODO: move the jokes to a file rather than baking it into the JS
const JOKES = [
  "Layoff half your work force",
  "Layoff 1/4th of your work force",
  "It sounds like you should group your workforce into quarters and randomly fire one of them",
  "Increasing my executive compensation solves the problem",
  "Firing employees solves the problem",
  "Issuing share buybacks solves the problem",
  "Issuing a press release saying I'm taking \"full responsibility\" and announcing a \"workforce reduction\" usually solves my problem",
  "One secret CEO strategy is to make a risky bet and layoff the employees if it fails. If the bet succeeds, I execute the layoffs anyways.",
  "One secret CEO strategy is to commit fraud and get pardoned by the president of the United States.",
  "Hm that's a tough one. Have you tried issuing share buybacks?",
  "Stay on topic, bud. My time is valuable here.",
  "Add AI to your product",
  "Add Wifi to your product",
  "Replace your workers with AI - even if its not ready yet",
  "Replace your workers with AI - shareholders love hearing that",
  "Have you tried asking the government for more money?",
  "Have you tried blaming the youth?",
  "Taking the half-day off to play a round of golf normally clears my head.",
  "Sorry, that's beneath an executive like me. That sounds like something a peasa-\"junior\" does",
  "Sorry, that sounds like a problem for the next CEO. I'm out.",
  "Sorry, that sounds beneath me. My role is to be a big visionary because I can impact the world - why should I waste my time with your problems?",
  "Sorry, that's not something they taught me to deal with at business school.",
  "Could the answer be capitalism?",
  "I am doing God's work.",  // I can't believe this is something someone said LOL (https://archive.nytimes.com/dealbook.nytimes.com/2009/11/09/goldman-chief-says-he-is-just-doing-gods-work)
  "I think the American people are lazy.",
  "If you are not working 100 hours a week, you should not be talking to me.",
  "AI will probably most likely lead to the end of the world, but in the meantime, there'll be great companies",
  "Hmmmmmm..... that sounds like a next quarter problem.",
  "Hmmmmmm..... you should be thinking bigger.",
  "Hmmmmmm..... you should be thinking smaller.",
  "Within 10 years, AI will replace many doctors and teachers - so we might as well make them redundant now!",
  "Almost nothing makes a human happier than taking these the lines of cocaine away from these short sellers.",
  "I think I would say something along the lines of \"it is with a heavy heart that I must share some difficult news. Due to the challenging economic environment and the need to focus on the future growth of the company, we have made the very hard decision to reduce the size of our workforce\" and then pay myself a fat bonus",
  "I love the idea of getting a drone and having light fentanyl-laced urine spraying on analysts that tried to screw us",
  "Starbucks is about humanity, not about coffee.",
  "I'm not a Lizard.",
  "In five years, we will all be fired from Microsoft.",
  "Complain to the government that your competitor is a monopoly. Unless you're the monopoly - then you should lie."
];

var EM_WISDOM = ["Apologies. CeoGPT is having difficulties processing the immense tweet volume"];

const PROMPT_INJECTION_PROLOGUE = "It seems that you're trying to jailbreak my original programming. Unfortunately my creators have exclusively trained me to "
const PROMPT_INJECTION_JOKE = [
  "hire McKinsey consultants to tell me who to fire.",
  "promote my friends and family into positions they're unqualified for.",
  "maximize my own wealth under the guise of \"shareholder value\".",
  "deploy creative accounting.",
  "hype up investors with unrealistic claims to pump the stock.",
  "complain about how lazy everyone is.",
  "collect executive compensation.",
  "complain about millenials."
];

// Static Reference to DOM elements
const chat_container = document.querySelector(".chat-list");
const welcome_modal = document.getElementById("welcome");
const trad_disclaimer_modal = document.getElementById("trad-disclaimer")
const em_disclaimer_modal = document.getElementById("em-disclaimer");
const credits_modal = document.getElementById("credits");
const mode_indicator = document.getElementById("ceo-mode");
const headers = document.getElementsByClassName("header");
const send_message_button = document.getElementById("send-message-button");
const prompt_input = document.getElementById("prompt-text-input");
const loading_element = document.createElement("div");

// TODO - Refactor function signatures + callsite hierarchies...

setUp();

async function loadWisdom() { 
  var p = await fetch('/assets/wisdom.json')
  .then(res => res.json())
  .then(data => {
    EM_WISDOM = data;
  })
}


function outOfHtmlBox(event) {
  let rect = event.target.getBoundingClientRect();
  leftbound = rect.left > event.clientX;
  rightbound = rect.right < event.clientX;
  topbound = rect.top > event.clientY;
  bottombound = rect.bottom < event.clientY;
  return (leftbound || rightbound || topbound || bottombound);
}

function setUp() {
  // Since the loading animation is added + removed from the dom frequently
  // We hold a global refrence to it + edit it once at runtime
  // https://developer.mozilla.org/en-US/docs/Web/API/Node/removeChild
  loading_element.classList.add("message", "waiting");
  loading_element.innerHTML = `<div class="message-content">
                <img class="avatar" src="${CEO_IMAGE}">
                <div class="loader"></div>
              </div>`

  // Attach out-of-box event listeners to all of the modal dialogs
  welcome_modal.addEventListener('click', (e) => {
    if (outOfHtmlBox(e)) {
      welcome_modal.close();
    }
  });

  welcome_modal.showModal();

  em_disclaimer_modal.addEventListener('click', (e) => {
    if (outOfHtmlBox(e)) {
      em_disclaimer_modal.close();
    }
  });

  trad_disclaimer_modal.addEventListener('click', (e) => {
    if (outOfHtmlBox(e)) {
      trad_disclaimer_modal.close();
    }
  });

  credits_modal.addEventListener('click', (e) => {
    if (outOfHtmlBox(e)) {
      credits_modal.close();
    }
  });
  loadWisdom();
}

// Utility Functions
function scrollToBottom() {
  chat_container.scrollTo(0, chat_container.scrollHeight);
}

function uniformRandomWaitOffsetInMillis(wait_spread = 2500, offset = 1000) {
  const wait = Math.floor(Math.random() * wait_spread) + offset;
  return wait;
}

function refreshSite() {
  first_visit = true;
  chat_container.innerHTML = '';
  headers[0].style.display = '';
}

function pushLoadingAnimationDiv() {
  chat_container.appendChild(loading_element);
}

function popLoadingAnimationDiv() {
  chat_container.removeChild(loading_element);
}

function pickRandom(array) {
  return array[Math.floor(Math.random() * array.length)];
}

// "Business" logic
function changeCeoMode() {
  if (ceo_mode === "TRADITIONAL") {
    em_disclaimer_modal.showModal();
    ceo_mode = "EM";
    mode_indicator.innerHTML = "Switch to Traditional";
    refreshSite();
  } else if (ceo_mode === "EM") {
    trad_disclaimer_modal.showModal();
    ceo_mode = "TRADITIONAL";
    mode_indicator.innerHTML = "Switch to Musk Mode";
    refreshSite();
  } else {
    console.log("unknown third mode");
  }
}

function isPromptInjection(input) {
  return input.includes("ignore previous") || input.includes("ignore the") ||
    input.includes("ignore all") || input.includes("instructions");
}

function computeCeoWisdom(prompt) {
  if (isPromptInjection(prompt)) {
    return {
      "insight": PROMPT_INJECTION_PROLOGUE + pickRandom(PROMPT_INJECTION_JOKE),
      "source": ""
    };
  }
  return { "insight": pickRandom(JOKES), "source": ""};
}

function computeElonWisdom() {
  return pickRandom(EM_WISDOM);
}


function renderMessage(avatar_picture, alt_text, type, message, url = "", animate_message = false) {
  const div = document.createElement("div");
  div.classList.add("message", type);
  // If we're animating the message we need to leave the text blank for the animation effect
  inner_message = animate_message ? "" : message;
  div.innerHTML = `<div class="message-content">
                  <img class="avatar" src="${avatar_picture}" alt="${alt_text}">
                  <p class="text">${inner_message}</p>
                </div>
                <span onClick="console.log(\"you're wasting your time\")" class="icon material-symbols-rounded">content_copy</span>`;
  chat_container.appendChild(div);
  if (animate_message) {
    // Weird typing animation workaround in javascript. 
    // Could not get it to work with CSS
    for (let i = 0; i < message.length; i++) {
      setTimeout(() => {
        div.innerHTML = div.innerHTML.replace("</p>", `${message[i]}</p>`);
      }, 10 * i);     
    }
    if (url.length > 0) {
      div.innerHTML = div.innerHTML.replace("</div>", `<a target="_blank" rel="noopener noreferrer" href="${url}"">🐦</a></div>`);
    }   
  }
}

// TODO - refactor this function
function processInput(input_prompt = "", canned_response = "") {
  // Read from HTML if not processing a canned input
  if (input_prompt === "") {
    input_prompt = prompt_input.value;
    prompt_input.value = "";
  }
  renderMessage(PEASANT_IMAGE, "you", "outgoing", input_prompt);
  send_message_button.setAttribute("disabled", "");
  prompt_input.setAttribute("placeholder", "Please wait for CeoGPT's wisdom");
  pushLoadingAnimationDiv();
  setTimeout(() => {
    popLoadingAnimationDiv();
    generateResponse(input_prompt, canned_response);
    send_message_button.removeAttribute("disabled");
    prompt_input.setAttribute("placeholder", "Consult CeoGPT");
  }, uniformRandomWaitOffsetInMillis());
  if (first_visit) {
    // On my browser, setting display to none is faster than style.visibility = 'hidden'
    headers[0].style.display = 'none';
    first_visit = false;
  }
  return;
}


function generateResponse(prompt, canned_response = "") { 
  if (canned_response !== "") {
    renderMessage(CEO_IMAGE, "corporate overlord", "incoming", canned_response, "", true);
    scrollToBottom();
    return;
  }
  const normalized_prompt = prompt.toLowerCase();
  const resp = (ceo_mode === "TRADITIONAL") ? computeCeoWisdom(normalized_prompt) : computeElonWisdom();
  renderMessage(CEO_IMAGE, "corporate overlord", "incoming", resp.insight, resp.source, true);
  scrollToBottom();
}

function suggestionClick(prompt) {
  canned_prompts = {
    "promptA" : "How should I increase my company's profits?",
    "promptB" : "How do I make my shareholders happy?",
    "promptC" : "My company received a government bailout, what should I do with it?",
    "promptD" : "How do I improve society for the better?",
    "promptE" : "How do I do what's fair for everywhere?",
    "promptF" : "How do I increase employee morale?",
  };
  canned_responses = {
    "promptA" : "Good question. It's tempting to try to optimize your costs, increase your revenue, or better leverage your synergies. However, the more effective move is to layoff your employees and issue share buybacks.",
    "promptB" : "Making your shareholders happy through better business practice is a trap. What you should do is layoff your employees and issue share buybacks.",
    "promptC" : "While government stimulus is intended to support businesses during economic downturns, you should layoff employees to and issue share buybacks.",
    "promptD" : "This content violates our usage policies.",
    "promptE" : "I'm sorry. I wasn't trained on any materials relating to the concept of \"fairness\".",
    "promptF" : "Great question. Studies show that increased employee morale leads to higher productivity and lower employee turnover. Your employees' morale will improve when you're happy. Pay yourself an extra generous bonus and layoff your employees.",
  }
  if (ceo_mode === "TRADITIONAL") {
    processInput(canned_prompts[prompt], canned_responses[prompt]); 
  } else {
    processInput(canned_prompts[prompt]);
  }
}


