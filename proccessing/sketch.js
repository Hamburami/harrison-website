let sphere;

function setup() {
  createCanvas(800, 800);
  colorMode(HSB, 255);
  // sphere = new Spheroid(100, 200, 400, color(140, 225, 205), [0.1, 0.15]);
  // sphere2 = new Spheroid(100, 500, 400, color(140, 225, 205), [0.1, 0.1]);
  eyes = new Eyes(400, 800, 100, color(140, 225, 205));
  eyes2 = new Eyes(300, 400, 80, color(150, 225, 205));
  eyes3 = new Eyes(900, 1200, 50, color(125, 225, 205));
  eyes4 = new Eyes(1100, 460, 120, color(245, 225, 155));
  eyes5 = new Eyes(200, 1300, 40, color(245, 55, 0));
  eyes6 = new Eyes(600, 1400, 20, color(245, 55, 0));
  // allEyes = [];
  // eyeCount = random(2, 6);
  // for (let i = 0; i < eyeCount; i++) {
  //   allEyes.push(RandEyes());
  // }
}

function draw() {
  background(190, 155, 25);
  // sphere.render();
  // sphere2.render();
  eyes.render();
  eyes2.render();
  eyes3.render();
  eyes4.render();
  eyes5.render();
  eyes6.render();

  // for (let i = 0; i < allEyes.length; i++) {
  //   allEyes[i].render();
  // }
}

function keyTyped() {
  
}

function RandEyes() {
  return new Eyes (Math.round(random(100, 1500)), Math.round(random(100, 1500)), Math.round(random(10, 100)), color(random(0, 360), random(120, 222), random(150, 255)));
  let x = random(100, 1400);
  console.log(x);
  return new Eyes(Math.round(x), 1400, 20, color(245, 55, 0));
}

class Eyes {
  constructor(x, y, radius, baseColor) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.baseColor = baseColor;
    let hey = random(0.05, 0.08);
    this.lookValue = [hey, hey + random(-0.02, 0.05), random(0, 0.5) * random(0.5, 2)];
    this.left = new Spheroid(radius, x-radius*1.5, y, baseColor, this.lookValue);
    this.right = new Spheroid(radius, x+radius*1.5, y, baseColor, this.lookValue);
  }

  render() {
    this.left.render();
    this.right.render();
  }
}

class Spheroid {
  constructor(radius, x, y, baseColor, lookValue) {
    this.radius = radius;
    this.x = x;
    this.y = y;
    this.baseColor = baseColor;
    this.radiusSquared = radius * radius;
    this.lookValue = lookValue;
  }

  render() {
      loadPixels();
      let d = pixelDensity();
      
      // Light direction (mostly head-on with subtle movement)
      let lightX = cos(frameCount * this.lookValue[0]) * this.lookValue[2];
      let lightY = sin(frameCount * this.lookValue[1]) * this.lookValue[2];
      let lightZ = 1.0;
      
      // Precalculate colors and remove unused variables
      let color1 = color(280, 100, 100);
      let color2 = color(0, 0, 255);
      let color3 = this.baseColor;
      let color4 = color(0, 0, 0);
      
      // Cache color components
      let r1 = red(color1), g1 = green(color1), b1 = blue(color1);
      let r2 = red(color2), g2 = green(color2), b2 = blue(color2);
      let r3 = red(color3), g3 = green(color3), b3 = blue(color3);
      
      let startX = max(0, this.x - this.radius);
      let endX = min(width*d, this.x + this.radius);
      let startY = max(0, this.y - this.radius);
      let endY = min(height*d, this.y + this.radius);
      
      let invRadius = 1 / this.radius;
      
      for (let y = startY; y < endY; y++) {
          for (let x = startX; x < endX; x++) {
              let dx = x - this.x;
              let dy = y - this.y;
              let distSquared = dx * dx + dy * dy;
              
              if (distSquared <= this.radiusSquared) {
                  // Calculate surface normal
                  let nx = dx * invRadius;
                  let ny = dy * invRadius;
                  let nz = sqrt(1 - nx*nx - ny*ny);
                  
                  // Calculate light intensity
                  let dot = nx * lightX + ny * lightY + nz * lightZ;
                  dot = map(dot, -1, 1, 0, 1);
                  
                  let idx = 4 * (y * width * d + x);
                  
                  // Simplified color selection without creating new color objects
                  if (dot < 0.15) {
                      pixels[idx] = r1;
                      pixels[idx + 1] = g1;
                      pixels[idx + 2] = b1;
                  } else if (dot < 0.9) {
                      pixels[idx] = r2;
                      pixels[idx + 1] = g2;
                      pixels[idx + 2] = b2;
                  } else if (dot < 0.98) {
                      pixels[idx] = r3;
                      pixels[idx + 1] = g3;
                      pixels[idx + 2] = b3;
                  } else {
                      pixels[idx] = 0;
                      pixels[idx + 1] = 0;
                      pixels[idx + 2] = 0;
                  }
                  pixels[idx + 3] = 255;
              }
          }
      }
      
      updatePixels();
    // loadPixels();
    
    // // Calculate bounds for pixel processing (square around the circle)
    // let startX = max(0, this.x - this.radius);
    // let endX = min(width, this.x + this.radius);
    // let startY = max(0, this.y - this.radius);
    // let endY = min(height, this.y + this.radius);
    
    // // Process each pixel in the bounding box
    // for (let y = startY; y < endY; y++) {
    //   for (let x = startX; x < endX; x++) {
    //     // Calculate squared distance from center
    //     let dx = x - this.x;
    //     let dy = y - this.y;
    //     let distSquared = dx * dx + dy * dy;
        
    //     // If inside the circle
    //     if (distSquared <= this.radiusSquared) {
    //       // Calculate normalized distance (0 at center, 1 at edge)
    //       let normalizedDist = sqrt(distSquared) / this.radius;
          
    //       // Calculate brightness based on distance from center
    //       let brightness = map(normalizedDist, 0, 1, 1, 0.2);
          
    //       // Calculate pixel index
    //       let idx = 4 * (y * width + x);
          
    //       // Get base color components
    //       let r = red(this.baseColor);
    //       let g = green(this.baseColor);
    //       let b = blue(this.baseColor);
          
    //       // Apply brightness to color
    //       pixels[idx] = r * brightness;     // R
    //       pixels[idx + 1] = g * brightness; // G
    //       pixels[idx + 2] = b * brightness; // B
    //       pixels[idx + 3] = 255;           // A
    //     }
    //   }
    // }
    
    // updatePixels();
  }
}