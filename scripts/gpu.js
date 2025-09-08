
async function main() {
    // Get the HTML elements
    const canvas = document.querySelector("canvas");
    const errElement = document.getElementById("error");

    // Check if webGPU is supported
    if (!navigator.gpu) {
        errElement.classList.replace("hidden", "visible");
        canvas.classList.replace("visible", "hidden");
        throw new Error("WebGPU not supported on this browser.");
    }

    // Check if the adapter is available
    const adapter = await navigator.gpu.requestAdapter();
    if (!adapter) {
        errElement.classList.replace("hidden", "visible");
        canvas.classList.replace("visible", "hidden");
        throw new Error("No appropriate GPUAdapter found.");
    }

    const device = await adapter.requestDevice();
    const canvasFormat = navigator.gpu.getPreferredCanvasFormat(); // This ensures the texture format is best fitting for the system (color format)
    const context = canvas.getContext("webgpu");
    context.configure({
        device: device,
        //alphaMode: 'premultiplied', // for transparency 
        format: canvasFormat,
    });

    const encoder = device.createCommandEncoder();

 

    const module = device.createShaderModule({
    label: 'harrisons shader',
    code: `
      @vertex fn vs(
        @builtin(vertex_index) vertexIndex : u32
      ) -> @builtin(position) vec4f {
        let pos = array(
          vec2f( -1.0, 3.0),  // top left
          vec2f(-1.0, -1.0),  // bottom left
          vec2f(3.0, -1.0)   // bottom right
        );
 
        return vec4f(pos[vertexIndex], 0.0, 1.0);
      }
 
      @fragment fn fs(@builtin(position) fragCoord : vec4f) -> @location(0) vec4f {

          // --- Config (tweak as you like) ---
        let RES      = 512.0;                         // matches your current usage
        let center   = vec2f(RES * 0.5, RES * 0.5);   // sphere center
        let r        = 150.0;                         // sphere radius (matches your cutoff)
        let ambient  = 0.15;                          // 0..1 ambient
        let L        = normalize(vec3f(0.4, -0.6, 0.7)); // light dir, normalized

        // Four flat colors (dark -> light). Replace with your palette.
        let C0 = vec3f(0.08, 0.10, 0.18);
        let C1 = vec3f(0.18, 0.30, 0.55);
        let C2 = vec3f(0.55, 0.75, 0.90);
        let C3 = vec3f(0.95, 0.98, 1.00);

        // Background (keep your uv debug)
        let uv = fragCoord.xy / RES;

        // --- Circle mask ---
        let d  = fragCoord.xy - center;
        let d2 = dot(d, d);
        if (d2 > r * r) {
          return vec4f(uv, 0.0, 1.0); // outside the sphere
        }

        // --- Reconstruct sphere normal at this pixel (z >= 0 cap) ---
        let nx = d.x / r;
        let ny = d.y / r;
        let nz = sqrt(max(0.0, 1.0 - (d2 / (r * r))));
        let N  = vec3f(nx, ny, nz);

        // --- Toon Lambert with 4 bands (no lerp) ---
        let ndotl = max(0.0, dot(N, L));
        let I = ambient + (1.0 - ambient) * ndotl; // intensity in [ambient..1]

        var col : vec3f;
        if (I < 0.25) {
          col = C0;
        } else if (I < 0.50) {
          col = C1;
        } else if (I < 0.75) {
          col = C2;
        } else {
          col = C3;
        }

        return vec4f(col, 1.0);


        // let uv = fragCoord.xy / 512; // should somehow get the resolution from js
        // let center = vec2f(256.0, 256.0); 
        
        // if(distance(fragCoord.xy, center) < 150) {
        //   return vec4f(1.0, 1.0, 1.0, 1.0);
        // }
        // return vec4f(uv, 0.0, 1.0);
      }
    `,
    });

    const pipeline = device.createRenderPipeline({
      layout: "auto",
      vertex: { module, entryPoint: "vs" },
      fragment: { module, entryPoint: "fs", targets: [{ format: canvasFormat }] },
      primitive: { topology: "triangle-list" }
    });

    const pass = encoder.beginRenderPass({
      colorAttachments: [{  
          view: context.getCurrentTexture().createView(),
          loadOp: "clear",
          clearValue: { r: 0.2, g: 0, b: 0.4, a: 1 }, //no need to type rgba, just the values will do
          storeOp: "store",
      }]
    });

  pass.setPipeline(pipeline);
  pass.draw(3);
  pass.end();

  device.queue.submit([encoder.finish()]);
}

main();
