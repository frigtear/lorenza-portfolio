import { getClient, Client, WebGpuApp } from "/static/index.js";
import {Model, Vertex} from "/static/parser.js"

const code = 
`
    struct Uniform {
        mvp : mat4x4f, 
    }
    
    struct Vertex {
        @location(0) position: vec4f,
    };

    @group(0) @binding(0) var<uniform> uniformData : Uniform;

    @vertex
    fn vs(vertex: Vertex) -> @builtin(position) vec4f {
        var result: vec4f = uniformData.mvp * vertex.position;
        return result;
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
    
    TableApp.writeBuffers()

    renderPass.setBindGroup(0, TableApp.bindGroups[0])
    renderPass.setVertexBuffer(0, TableApp.buffers[0].buffer)
    renderPass.setIndexBuffer(TableApp.buffers[1].buffer, 'uint16')

    renderPass.drawIndexed(model.finalBufferValues.faces.length)
    renderPass.end()
    const commands = encoder.finish();

    return commands;
}

async function main(){

    const client = await getClient()

    const Bunny = new Model("/static/models/bunny.obj")
    await Bunny.loadFromFile()
    const formBuffInfo = Bunny.createMatrices(client.canvas)

    const finalValues = Bunny.finalBufferValues

    const verticesToWrite = new Float32Array(finalValues.vertices)
    const facesToWrite = new Uint16Array(finalValues.faces)
    const mvpToWrite = formBuffInfo.finalMvpValues;


    const TableApp = new WebGpuApp("Table", client)

    TableApp.setShaderModule(code)

    const tablePipeline = TableApp.client.device.createRenderPipeline({
        label:`${TableApp.name} pipeline`,
        layout:'auto',
        vertex:{
            module:TableApp.shaderModule,
            buffers: [
                {
                  arrayStride: 4 * 4, // 4 floats, 4 bytes each
                  attributes: [
                    {shaderLocation: 0, offset: 0, format: 'float32x4'},  // position
                  ],
                },
              ],
            entryPoint:'vs'
        },
        fragment:{
            module:TableApp.shaderModule,
            entryPoint:'fs',
            targets:[{format:client.format}]
        }

    })

    TableApp.pipeline = tablePipeline

    TableApp.resizeCanvas()

    const bunnyTexBuff = TableApp.addVertexBuffer("Bunny Vertex Buffer", verticesToWrite.byteLength) // index 0
    const bunnyDexBuff = TableApp.addIndexBuffer("Bunny Index Buffer", facesToWrite.byteLength) // index 1
    const bunnyFormBuff = TableApp.addUniformBuffer("Bunny Matrix Uniform", mvpToWrite.byteLength)

    const texToWrite = {
        index:bunnyTexBuff.index,
        data:verticesToWrite
    }

    const dexToWrite = {
        index:bunnyDexBuff.index,
        data:facesToWrite
    }

    const formToWrite = {
        index:bunnyFormBuff.index,
        data:mvpToWrite
    }

    TableApp.toWriteToBuff.push(texToWrite)
    TableApp.toWriteToBuff.push(dexToWrite)
    TableApp.toWriteToBuff.push(formToWrite)

    TableApp.addBindGroup("uniform MVP matrix bind group", bunnyFormBuff.buffer)

    TableApp.renderPassDescriptor.colorAttachments[0].view = client.context.getCurrentTexture().createView();

    TableApp.commandBuffer = encodeCommands(TableApp, Bunny)
    TableApp.run();
}

main()