import { getClient, Client, WebGpuBuilder } from "/static/index.js";


async function main(){
    const TableApp = new WebGpuBuilder("Table")
    const client = await getClient();
    console.log(client)
    console.log(client.canvas)
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
    TableApp.resizeCanvas(client);
    TableApp.setShaderModule(client, code)
    TableApp.setPipeline(client);

    TableApp.renderPassDescriptor.colorAttachments[0].view = client.context.getCurrentTexture().createView();
    const encoder = client.device.createCommandEncoder({
        label:"table encoder",
        });
    const pass = encoder.beginRenderPass(TableApp.renderPassDescriptor);
    pass.setPipeline(TableApp.pipeline);
    pass.draw(3)
    pass.end()
    const commands = encoder.finish();

    TableApp.commandBuffer = commands

    TableApp.run(client);
}

main()
    