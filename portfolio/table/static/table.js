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




function encodeCommands(TableApp, model){
    const encoder = TableApp.client.device.createCommandEncoder({
        label:"table encoder",
        });

    const renderPass = encoder.beginRenderPass(TableApp.renderPassDescriptor);
    renderPass.setPipeline(TableApp.pipeline);
    

   
/*
    let verticesArray = [];
    for (let vec of model.vertices) {
        verticesArray.push(vec[0], vec[1], vec[2]);
    }
    
    let verticesTypedArray = new Float32Array(verticesArray);
    const size = verticesTypedArray.length * 4
    TableApp.client.device.queue.writeBuffer(buffer, 0, verticesTypedArray)
    */

    renderPass.setBindGroup(0, TableApp.bindGroups[0]);
    renderPass.draw(model.finalBufferValues.vertices.length)
    renderPass.end()
    const commands = encoder.finish();

    return commands;
}


async function main(){
    const Bunny = new Model("/static/models/bunny.obj")
    await Bunny.loadFromFile()
    finalValues = Bunny.finalBufferValues

    verticesToWrite = new Float32Array(finalValues.vertices)
    facesToWrite = new Uint16Array(finalValues.faces)

    const client = await getClient()
    const TableApp = new WebGpuApp("Table", client)

    TableApp.resizeCanvas()

    const bunnyTexBuff = TableApp.addVertexBuffer("Bunny Vertex Buffer", vertices.byteLength).buffer // index 0
    const bunnyDexBuff = TableApp.addIndexBuffer("Bunny Index Buffer", vertices.byteLength).buffer // index 1

    const texToWrite = {
        index:bunnyTexBuff.index,
        data:verticesToWrite
    }

    const dexToWrite = {
        index:bunnyDexBuff.index,
        data:facesToWrite
    }

    TableApp.toWriteToBuff.push(texToWrite)
    TableApp.toWriteToBuff.push(dexToWrite)

    TableApp.addBindGroup("Bunny bind group", 0, [bunnyTexBuff, bunnyDexBuff])

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
    