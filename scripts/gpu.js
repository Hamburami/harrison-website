
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
        let uv = fragCoord.xy / 512; // should somehow get the resolution from js
        let center = vec2f(256.0, 256.0); 
        
        if(distance(fragCoord.xy, center) < 150) {
          return vec4f(1.0, 1.0, 1.0, 1.0);
        }
        return vec4f(uv, 0.0, 1.0);
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
