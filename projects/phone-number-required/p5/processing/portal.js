
let wins = [];
let serverManagerOpen = false;

let online = false;

function setup() {
  createCanvas (window.innerWidth, window.innerHeight);
}

function windowResized() {
  resizeCanvas(window.innerWidth, window.innerHeight);
}

function draw() {
  // background(random(360), 20, 95);
  // win.display();
  background (100, 150, 230);
  fill(255, 255, 255);
  textAlign(LEFT, CENTER);
  textSize(14);


  noStroke();
  fill(255);
  text ("SERVER MANAGER", 10, 270);
  fill(color(200, 100, 50));
  rect (50, 200, 50, 50);

  if (online){
    fill(255);
    text ("WINDOW FUN APP", 10, 170);
    fill(color(50, 50, 255));
    rect (50, 100, 50, 50);
  }

  for (let win of wins) {
    win.display();
    win.update();
  }

  
}

function keyPressed() {
  if (key === 'r' || key === 'R') {
    redraw();
  }
}


function mousePressed() {
  let nonePressed = true;
  for (let i = wins.length-1; i >=0; i--) {
    if (wins[i].mousePressed()) {
      nonePressed = false;
      break;
    }
  }
  if (nonePressed) {
    if (
      mouseX >= 50 &&
      mouseX <= 50 + 50 &&
      mouseY >= 200 &&
      mouseY <= 200 + 50
    ) {
      openServerManager();
    }

    if (
      mouseX >= 50 &&
      mouseX <= 50 + 50 &&
      mouseY >= 100 &&
      mouseY <= 100 + 50 && 
      online
    ) {
      newWindow();
    }
  }
}

function mouseReleased() {
  for (let win of wins) {
    win.mouseReleased();
  }
}

function newWindow() {
  let newWin = new DraggableWindow(
     random(20, 400),
     random(20, 400),
     random(250,400) ,
     random(150, 300),
     "Fun Window (for having fun with)"
   );
   wins.push(newWin);
}

function openServerManager() {
  // 
  if (!serverManagerOpen){
    let newWin = new serverApp(150,150);
    wins.push(newWin);
    serverManagerOpen = true;
  }

}
// class window {
//   constructor(x, y, w, h, title) {
//     this.x = x;
//     this.y = y;
//     this.w = w;
//     this.h = h;
//     this.title = title;

//     this.dragging = false;
//     this.offsetX = 0;
//     this.offsetY = 0;
//     this.titleBarHeight = 30;
//   }
// }

class DraggableWindow {
  constructor(x, y, w, h, title) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.title = title;

    this.dragging = false;
    this.offsetX = 0;
    this.offsetY = 0;
    this.titleBarHeight = 30;
    this.body = color(144, 207, 248);
  }

  display() {
    // Body
    fill(this.body);
    stroke(0);
    rect(this.x, this.y, this.w, this.h);

    // Title bar
    fill(0, 0, 128);
    stroke(0);
    rect(this.x, this.y, this.w, this.titleBarHeight);

    // Title text
    fill(255);
    noStroke();
    textSize(14);
    textAlign(LEFT, CENTER);
    text(this.title, this.x + 10, this.y + this.titleBarHeight / 2);

    // Close Window
    fill(255, 0, 0);
    noStroke();
    rect(this.x + this.w - this.titleBarHeight, this.y, this.titleBarHeight, this.titleBarHeight);
  }

  mousePressed() {
    if (mouseX > this.x + this.w - this.titleBarHeight && mouseX < this.x + this.w &&
      mouseY > this.y && mouseY < this.y + this.titleBarHeight) {
        this.close();
        return true;
    } else if (mouseX > this.x && mouseX < this.x + this.w &&
        mouseY > this.y && mouseY < this.y + this.h) { // CLicked in the window

        wins.push(wins.splice(wins.indexOf(this), 1)[0]); // Move window to front of screen
    
      if (mouseX > this.x && mouseX < this.x + this.w &&
        mouseY > this.y && mouseY < this.y + this.titleBarHeight) { //Clicked in the title bar

        this.dragging = true;
        this.offsetX = mouseX - this.x;
        this.offsetY = mouseY - this.y;
          
      }

      return true;
    }

    return false;
  }

  mouseReleased() {
    this.dragging = false;
  }

  update() {
    if (this.dragging) {
      this.x = mouseX - this.offsetX;
      this.y = mouseY - this.offsetY;
    }

    if (this.x < 0)
      this.x = 0;
    if (this.x > width-this.w)
      this.x = width-this.w;
    if (this.y < 0)
      this.y = 0;
    if (this.y > height-this.h)
      this.y = height-this.h;
  }

  close() {
    const idx = wins.indexOf(this);
    if (idx !== -1) wins.splice(idx, 1);
  }
}


class serverApp extends DraggableWindow {
  constructor(x, y,) {
    super(x, y, 350, 350, "Server Manager");
    let barY = 80;
    let barX = 20;
    let barInc = 25;
    this.usBar = new powerBar(barX + 5*(30 + barInc), barY, 0.11);
    this.belarusBar = new powerBar(barX + 4*(30 + barInc), barY, 0.20);
    this.italyBar = new powerBar(barX + 3*(30 + barInc), barY, 0.72);
    this.brazilBar = new powerBar(barX + 2*(30 + barInc), barY, 0.78);
    this.germanyBar = new powerBar(barX + 30 + barInc, barY, 0.91);
    this.ukBar = new powerBar(barX, barY, 0.98);


    this.toggleBtn = new ToggleButton(20, 180, 260, 30, "Content Algorithm Power Diversion");
  }

  display() {
    super.display();

    textAlign(CENTER, BOTTOM);
    fill(0); // black text

    text("US",       this.x + this.usBar.x + 15,      this.y + this.usBar.y - 5);
    this.usBar.display(this.x, this.y);

    text("Belarus",  this.x + this.belarusBar.x + 15, this.y + this.belarusBar.y - 5);
    this.belarusBar.display(this.x, this.y);

    text("Italy",    this.x + this.italyBar.x + 15,   this.y + this.italyBar.y - 5);
    this.italyBar.display(this.x, this.y);

    text("Brazil",   this.x + this.brazilBar.x + 15,  this.y + this.brazilBar.y - 5);
    this.brazilBar.display(this.x, this.y);

    text("Germany",  this.x + this.germanyBar.x + 15, this.y + this.germanyBar.y - 5);
    this.germanyBar.display(this.x, this.y);

    text("UK",       this.x + this.ukBar.x + 15,      this.y + this.ukBar.y - 5);
    this.ukBar.display(this.x, this.y);


    this.toggleBtn.display(this.x, this.y + this.titleBarHeight);

  }

  mousePressed() {

    // Pass click to toggle button
    if (this.toggleBtn.mousePressed(this.x, this.y + this.titleBarHeight)) {
      this.divertPower();
      this.toggleBtn.clickable = false;
      online = true;
      wins.push(new finalWindow());
      return false;
    }

    return super.mousePressed();
  }

  divertPower() {
    this.usBar.power = 0.85;
    this.belarusBar.power = 0.88;
    this.italyBar.power = 0.9;
    this.brazilBar.power = 0.91;
    this.germanyBar.power = 0.94;
  }

  close() {
    super.close();
    serverManagerOpen = false;
  }
}


class powerBar {
  constructor(x, y, pwrLevel) {
    this.power = pwrLevel;
    this.x = x;
    this.y = y;
    this.variation = 0.0;
  }

  display(ofsX, ofsy) {
    this.variation += random(-0.003, 0.003);
    if (this.variation > 0.1) 
      this.variation = 0.1;
    if (this.variation < -0.1)
      this.variation = -0.1;

    let powerVar = this.power + this.variation
    noFill();
    stroke(51);
    rect(this.x+ofsX, this.y+ofsy, 30, 80);
    noStroke();
    fill(paletteLerp([
    ['red', 0],
    ['orange', 0.3],
    ['yellow', 0.6],
    ['green', 0.8]
    ], (powerVar)));
    rect(this.x+ofsX, this.y + ofsy + ((1-powerVar)*80), 30, 80-((1-powerVar)*80));
    
    fill(0);
  }
}

class ToggleButton {
  constructor(x, y, w = 20, h = 20, label, initialState = true) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.label = label;
    this.state = initialState;
    this.clickable = true;
  }

  display(ofsX = 0, ofsY = 0) {
    // Label text to the left of the button
    noStroke();
    fill(0);
    textAlign(LEFT, CENTER);
    textSize(12);
    text(
      this.label,
      this.x + ofsX,
      this.y + ofsY + this.h / 2
    );


    let btnX = this.x + ofsX + textWidth(this.label) + 8;
    stroke(0);
    if (this.state) {
      fill(255); // white fill for ON
    } else {
      noFill(); 
    }
    rect(btnX, this.y + ofsY, 20, 20);

 
    noStroke();
    fill(0);
    textAlign(CENTER, CENTER);
    text(
      this.state ? "ON" : "OFF",
      btnX + 40,
      this.y + ofsY + this.h / 2
    );
  }

  mousePressed(ofsX = 0, ofsY = 0) {
    if (this.clickable) {
      let btnX = this.x + ofsX + textWidth(this.label) + 8;
      if (
        mouseX > btnX &&
        mouseX < btnX + this.w &&
        mouseY > this.y + ofsY &&
        mouseY < this.y + ofsY + this.h
      ) {
        this.state = !this.state;
        return true;
      }
      return false;
    }
  }
}

class finalWindow extends DraggableWindow {
  constructor() {
    super(100, 100, 450, 340, "You've signed up for Clearview Solutions");
    this.body = color('blue');
  }

  display() {
    super.display();
    fill('white');
    textSize(14);
    textAlign(LEFT, TOP);
    text("Congradulations, you have passed the Clearview Solutions commitment test.\n Your phone number has already been collected (a number of years ago) but your acccount has just now been activated. \n \nThis entire signup proccess was a test of perserverence and general business savviness. We will send a team of specialists to your address in 2 days to help pack your essential items and move you to our business facility. \n\nIn the meantime, we've granted you access to our window entertainment app. Many of our users have told us how much fun they've had with our window app and we think you'll you'll love it too! \n\nSee you soon, Clearview Solutions.", this.x + 20, this.y + 20 + this.titleBarHeight, this.w -40, this.h - 40);
  }
}