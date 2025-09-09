let img;

function preload() {
    img = loadImage('images/rug.png');
}

function setup() {
    createCanvas (400, 400);
}

function draw() {
    background(220);

    renderImage(img, 0, 0, 40);  
    //sqaure(0, 0, 200);
}

function renderImage(img, x, y, w) {
    img.loadPixels();
    for (let i = 0; i < img.width; i++) {
        for (let j = 0; j < img.height; j++) {
            let index = (i * img.width + j) * 4;
            let r = img.pixels[index];
            let g = img.pixels[index + 1];
            let b = img.pixels[index + 2];
            fill(r, g, b);
            noStroke();
            square(x + j * w, y + i * w, w);
        }
    }
}