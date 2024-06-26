import { getClient, Client, WebGpuApp } from "/static/index.js";
import {Model, Vertex} from "/static/parser.js"

const code = 
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

function encodeCommands(TableApp){
    
    const encoder = TableApp.client.device.createCommandEncoder({
        label:"table encoder",
        });
    const pass = encoder.beginRenderPass(TableApp.renderPassDescriptor);
    pass.setPipeline(TableApp.pipeline);
    pass.draw(3)
    pass.end()
    const commands = encoder.finish();

    return commands;
}

async function main(){
    const model = new Model("/static/models/canvas.obj")
    await model.loadFromFile();
    console.log(model.vertices)
    console.log(model.vertices[0])
    console.log(model.normals);
    console.log(model.textures);
    const client = await getClient();
    const TableApp = new WebGpuApp("Table", client)

    console.log(client)
    console.log(client.canvas)
    
    TableApp.resizeCanvas();
    TableApp.setShaderModule(code)
    TableApp.setPipeline();
    TableApp.renderPassDescriptor.colorAttachments[0].view = client.context.getCurrentTexture().createView();
    TableApp.commandBuffer = encodeCommands(TableApp)
    TableApp.run();
}

main()
    