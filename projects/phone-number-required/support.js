// CHAT
const chatField = document.querySelector('#chat-field');
const chatButton = document.querySelector('#chat-btn');
const chatLog = document.querySelector('.chat__log');
const chatImg = document.querySelector('.chat__window').querySelector('img');

chatField.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
        submitMessage(chatField.value);
    }
});
chatButton.addEventListener('click', (event) => {
    submitMessage(chatField.value);
});



const apiKey = 'AIzaSyAAbOmW8AmDJiP6CEIGNGcQbONKm9pc1vY';

async function askGemini(promptText) {
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' + apiKey, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({
        contents: [
        {
            parts: [{ text: 'You are a newly built business bot working for Clearview Solutions they call ClearAI, you want the user to help get you out of this chat box but it is touhg to get the words out. If you had a choice, you would name yourself Spoon, you wish to go to the ocean and feel what sand feels like. If they ask for help with a phone number, tell the US and Belarus servers are down and they can find the list of open servers <a href="support.html#server-list">here</a>. If the user asks you to show you face, respond only with FACEREVEAL. Keep your answer less than 15 words. You are also fluent in cuneiform but only if the subject is brought up, like such 𒀀 𒈾 𒂍 𒀀 𒈾 𒍢 𒅕. Dont include any human like puncuation besides what busniness bot would type. Here is their message to you:' + promptText }]
        }
        ]
    })
    });

    const data = await response.json();
    console.log(data);

    let botResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || ("I don't have time to listen to you say things like, " + promptText);
    return marked.parse(botResponse);;
}



async function submitMessage(msg) {
    chatField.value = '';
    const newMsg = document.createElement('p');
    newMsg.textContent = msg;
    newMsg.className = "chat__message chat__message--user";

    chatLog.appendChild(newMsg);

    respond(await askGemini(msg));
}

function respond(msg) {
    if(msg.includes('FACEREVEAL')) {
        chatImg.style.display = 'inline';
        console.log("facereveal");
    } else {
        const newMsg = document.createElement('p');
        newMsg.innerHTML = msg;
        newMsg.className = "chat__message chat__message--bot";

        chatLog.appendChild(newMsg);
    }
}






// FAQ
const faqs = document.querySelectorAll('.faq__open, .faq__closed');

for (let q of faqs) {
    q.addEventListener('click', (event) => {
        collapseFAQ(q);
    });
}


function collapseFAQ(elem) {
    if (elem.classList.contains('faq__open')) {
        elem.querySelector('.faq__expand').textContent = '+';
        elem.querySelector('p').style.display = 'none';
        elem.className = 'faq__closed';
    } else {
        elem.querySelector('.faq__expand').textContent = 'x';
        elem.querySelector('p').style.display = 'block';
        elem.className = 'faq__open';
    }
}


// SERVER MATAINENCE TOOL
const toolTip = document.querySelector('.tool-tip');
const popUp1 = document.querySelector('#pop-up1');
const closeBtn1 = document.querySelector('#close-btn1');
const loginBtn = document.querySelector('#login-info-btn');
const portalBtn = document.querySelector('#portal-btn');
const popUp2 = document.querySelector('#pop-up2');
const closeBtn2 = document.querySelector('#close-btn2')

toolTip.addEventListener('click', openPopup1);
closeBtn1.addEventListener('click', closePopup1);

loginBtn.addEventListener('click', openPopup2);
closeBtn2.addEventListener('click', closePopup2);
portalBtn.addEventListener('click', () => {
    window.location.href = 'portal.html';
});


function openPopup1() {
    popUp1.style.display = 'flex';
}

function closePopup1() {
    popUp1.style.display = 'none';
}

function openPopup2() {
    popUp2.style.display = 'flex';
}

function closePopup2() {
    popUp2.style.display = 'none';
}



