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

    struct VertexOutput {
        @builtin(position) position : vec4f,
        @location(0) color : vec4f,
    }

    @group(0) @binding(0) var<uniform> uniformData : Uniform;

    @vertex
    fn vs(vertex: Vertex, @builtin(vertex_index) index : u32) -> VertexOutput {
        var result: vec4f = uniformData.mvp * vertex.position;

        var colors = array<vec4f, 3>(
          vec4f(1, 0, 0, 1), // red
          vec4f(0, 1, 0, 1), // green
          vec4f(0, 0, 1, 1), // blue
        );

        var out : VertexOutput;

        out.position = result;
        out.color = (0.5 * (result + vec4f(1.0, 1.0, 1.0, 1.0)));
        return out;
       
    }

    @fragment
    fn fs(vertexOut : VertexOutput) -> @location(0) vec4f {
        return vertexOut.color;
    }
`

function render(TableApp, model){
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

    TableApp.client.device.queue.submit([commands])
}


async function main(){

    const client = await getClient()

    const Bunny = new Model("/static/models/cube.obj")
    await Bunny.loadFromFile()

    const eye = glMatrix.vec3.fromValues(4, 6, 2)
    const center = glMatrix.vec3.fromValues(0, 0 ,0)

    const formBuffInfo = Bunny.createMatrices(client.canvas, eye, center)

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
                    {shaderLocation: 0, offset: 0, format: 'float32x4'}, 
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
        data:mvp ToWrite
    }

    TableApp.toWriteToBuff.push(texToWrite)
    TableApp.toWriteToBuff.push(dexToWrite)
    TableApp.toWriteToBuff.push(formToWrite)

    TableApp.addBindGroup("uniform MVP matrix bind group", bunnyFormBuff.buffer)

    TableApp.renderPassDescriptor.colorAttachments[0].view = client.context.getCurrentTexture().createView();

    const settings = {
        eyeX: 4,
        eyeY: 6,
        eyeZ: 2
    }

    const gui = new dat.GUI()
    gui.onChange(render)
    gui.add(settings, "eyeX")
    gui.add(settings, "eyeY")
    gui.add(settings, "eyeZ")

    render(TableApp, Bunny)


}

main()