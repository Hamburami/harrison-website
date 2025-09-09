const input1 = document.querySelector('#input1');
const button1 = document.querySelector('#btn1');
const errZone = document.querySelector('.err-zone');


let countryCodeAsked = false;


input1.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
        checkErrors();
    }
});

button1.addEventListener('click', checkErrors);


function checkErrors() {
    if (/[^0-9+]/.test(input1.value)) {
        newError("Please only use digits and '+' to describe your number");
    } else if (input1.value.match(/\d/g).length < 10) {
        newError("Your number must be more than 10 digits");
    } else if (input1.value.match(/\d/g).length > 13) {
        newError("Your number must be less than 13 digits");
    } else if (!input1.value.startsWith('+')) {
        if (!countryCodeAsked) {
            newError("Please include your country code");
            countryCodeAsked = true;
        } else {
            newError("Please include your country code starting with '+'");
        }
    } else if (input1.value.startsWith('+1')) {
        USError("US region codes are currently not supported, for a list of supported countries ");
    } else if (input1.value.startsWith('+39') || input1.value.startsWith('+55') || input1.value.startsWith('+49') || input1.value.startsWith('+44')) {
        USError("Your number was accepted, but there was an proccessing error on our end. For help, ");
    }  else if (input1.value.startsWith('+375')) {
        USError("Belarus region codes are currently not supported, for a list of supported countries ");
    } else {
      USError("There was an error processing your number. For help ");
    }
   
}

function newError(errMsg) {
    const card = document.createElement('div');
    card.classList.add('err-card');

    const btn = document.createElement('button');
    btn.classList.add('err-card__btn');
    btn.textContent = 'x';
    btn.addEventListener('click', () => {
      card.remove(); 
    });

    const msg = document.createElement('p');
    msg.classList.add('err-card__msg');
    msg.textContent = errMsg;

    card.appendChild(btn);
    card.appendChild(msg);
    errZone.appendChild(card);
}


function USError (txt) {
    const card = document.createElement('div');
    card.classList.add('err-card');

    const btn = document.createElement('button');
    btn.classList.add('err-card__btn');
    btn.textContent = 'x';
    btn.addEventListener('click', () => {
      card.remove(); 
    });

    const msg = document.createElement('p');
    msg.classList.add('err-card__msg');
    msg.innerHTML = txt + '<a href="support.html#server-list">click here</a>';

    card.appendChild(btn);
    card.appendChild(msg);
    errZone.appendChild(card);
}

