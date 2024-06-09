import { initializeWebGPU, Client, WebGpuEnvironment } from "/static/index.js";


function createPipeline(device, description, format, module){
    const pipeline = device.createRenderPipeline({
        label:description,
        layout:'auto',
        vertex:{
            module,
            entryPoint:'vs'
        },
        fragment:{
            module,
            entryPoint:'fs',
            targets:[{format:format}]
        }
    })
    return pipeline;
}

function createTriangleShader(device){
    const module = device.createShaderModule({
        label:'triangle shader',
        code:
        `
        struct output {
            @builtin(position) position : vec4f,
        };

        @vertex
        fn vs(@builtin(vertex_index) index : u32) -> output{
            let vertices = array(
                vec2f(0.0, 0.5),
                vec2f(0.0, -0.5),
                vec2f(0.5, 0.0),
            );
            var out: output;
            out.position = vec4f(vertices[index], 0.0, 1.0);
            return out;
        }

        @fragment
        fn fs() -> @location(0) vec4f {
            return vec4f(1.0, 0.0, 0.0, 1.0);
        }
        `
    })    
    return module;
}

function render(client, pipeline, description, clearColor){
    const load = 'clear'
    const store = 'store';

    const renderPassDescriptor = {
        label:description,
        colorAttachments: [
            {
                clearValue: clearColor,
                loadOp: load,
                storeOp: store,
            }
        ]
    }

    renderPassDescriptor.colorAttachments[0].view = client.context.getCurrentTexture().createView();

    const encoder = client.device.createCommandEncoder({
        label:description,
        });
    const pass = encoder.beginRenderPass(renderPassDescriptor);
    pass.setPipeline(pipeline);
    pass.draw(3)
    pass.end()
    const commandBuffer = encoder.finish();
    client.device.queue.submit([commandBuffer]);
}


async function main(){
    const gray = [0.3, 0.3, 0.3, 0.3]
    const client = await initializeWebGPU()
    console.log(client.device);
    const module = createTriangleShader(client.device)
    const pipeline = createPipeline(client.device, 'table pipeline', client.format, module)
    render(client, pipeline, "table app", gray)
}

main()
    