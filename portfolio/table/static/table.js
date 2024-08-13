import { getClient, Client, WebGpuApp } from "/static/index.js";
import {Model, Vertex} from "/static/parser.js"

const code = 
`
    struct output {
        @builtin(position) position : vec4f,
    };
    
    struct Vertex {
        position : vec3f
    };

    @group(0) @binding(0) var<storage, read> pos : array<Vertex>;

    @vertex
    fn vs(@builtin(vertex_index) index : u32) -> output{
        var out: output;
        out.position = vec4f(pos[index].position, 1.0);
        return out;
    }

    @fragment
    fn fs() -> @location(0) vec4f {
        return vec4f(1.0, 0.0, 0.0, 1.0);
    }
`

function createStorageBuffer(TableApp, size){
    const canvasVertexBuffer = TableApp.client.device.createBuffer({
        label:`table canvas storage buffer`,
        size:size,
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST
    }) 
    return canvasVertexBuffer
}


function createBindGroup(TableApp, storageBuffer){
    const bindgroup0 = TableApp.client.device.createBindGroup({
        layout:TableApp.pipeline.getBindGroupLayout(0),
        entries: [{binding:0, resource: {buffer : storageBuffer}}]
    })

   return bindgroup0
}


function encodeCommands(TableApp, buffer, model, bindGroup){
    const encoder = TableApp.client.device.createCommandEncoder({
        label:"table encoder",
        });
    const pass = encoder.beginRenderPass(TableApp.renderPassDescriptor);
    pass.setPipeline(TableApp.pipeline);
    model.orthogonalize(TableApp.client.canvas.width, TableApp.client.canvas.height)
    let verticesArray = [];
    for (let vec of model.vertices) {
        verticesArray.push(vec[0], vec[1], vec[2]);
    }
    
    let verticesTypedArray = new Float32Array(verticesArray);
    const size = verticesTypedArray.length * 4
    TableApp.client.device.queue.writeBuffer(buffer, 0, verticesTypedArray)
    pass.setBindGroup(0, bindGroup);
    pass.draw(model.vertices.length)
    pass.end()
    const commands = encoder.finish();

    return commands;
}


async function main(){
    const model = new Model("/static/models/bunny.obj")
    await model.loadFromFile()
    const client = await getClient()
    const TableApp = new WebGpuApp("Table", client)
    TableApp.resizeCanvas()
    TableApp.setShaderModule(code)
    const canvasVertexBuffer = createStorageBuffer(TableApp, model.verticesSize)
    TableApp.setPipeline()
    const mainBindGroup = createBindGroup(TableApp, canvasVertexBuffer)
    TableApp.renderPassDescriptor.colorAttachments[0].view = client.context.getCurrentTexture().createView();
    console.log(model.vertices)
    TableApp.commandBuffer = encodeCommands(TableApp, canvasVertexBuffer, model, mainBindGroup)
    TableApp.run();
}

main()
    