function setup() {
    createCanvas(700, 700);
    loop();
    noSmooth();
}
let x;
let y;
let treeSize;
let increment = 1;
let clear = true;
let growing = false;
let run = false;
let savedBackground;
function draw() {
    console.log("\n drawn" + run);
    if (clear) {
        background(230, 100, 80);
        clear = false;
    } else {
        if (growing) {
            background(savedBackground);
            increment += 3.0;
            noStroke();
            fill(100, 50, 30);
            circle(mouseX, mouseY, increment);
            console.log(increment);
        } else if (run) {
            console.log("hello");
            fill(230, 210, 130);
            stroke(120, 80, 60);
            strokeWeight(3);
            circle(x, y, treeSize);
            noFill();
            let s = 1;
            while (s < treeSize) {
                let yearsRain = random(35.0);
                strokeWeight((yearsRain / 35.0) * 2);
                circle(x, y, s);
                s += yearsRain;
                console.log(s + "\n");
            }
            run = false;
        }
    }
}
function keyPressed() {
    if (key == "r") {
        noFill();
        stroke(80, 80, 20);
        strokeWeight(0.5);
        for (let i = 0; i < 10000; i++) {
            rect(
                random(-width, width),
                random(-height, height),
                random(-width, width),
                random(-height, height)
            );
        }
        redraw();
    }
}
function mousePressed() {
    growing = true;
    clear = false;
    savedBackground = get();
}
function mouseReleased() {
    growing = false;
    console.log(
        "\nreleased growing:" +
            growing +
            " clear " +
            clear +
            " increment " +
            increment
    );
    drawTree(mouseX, mouseY, increment);
    increment = 1.0;
    run = true;
    redraw();
}
function drawTree(newX, newY, newS) {
    console.log("\ndrreee " + newX + ", " + newY + "  " + newS);
    x = newX;
    y = newY;
    treeSize = newS; //redraw();
}
