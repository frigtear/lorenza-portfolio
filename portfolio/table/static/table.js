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


function renderFrame(engine, model){
    const encoder = TableApp.client.device.createCommandEncoder({
        label:"table encoder",
        });

    const renderPass = encoder.beginRenderPass(engine.renderPassDescriptor);
    renderPass.setPipeline(engine.pipeline);
    
    TableApp.writeBuffers()

    renderPass.setBindGroup(0, engine.bindGroups[0])
    renderPass.setVertexBuffer(0, engine.buffers[0].buffer)
    renderPass.setIndexBuffer(engine.buffers[1].buffer, 'uint16')

    renderPass.drawIndexed(model.finalBufferValues.faces.length)
    renderPass.end()
    const commands = encoder.finish();

    TableApp.client.device.queue.submit([commands])
}


async function main(){

    engine.setShaderModule(code)

    const engine = new Engine("Table", client)

    const pipeline = engine.client.device.createRenderPipeline({
        label:`${engine.name} pipeline`,
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
            module:engine.shaderModule,
            entryPoint:'fs',
            targets:[{format:client.format}]
        }
    })

    const client = await getClient()
    const object = new Model("/static/models/cube.obj")
    mesh = await object.loadFromFile()

    const eye = glMatrix.vec3.fromValues(4, 6, 2)
    const center = glMatrix.vec3.fromValues(0, 0 ,0)

    const formBuffInfo = engine.getTransformation(client.canvas, eye, center)

    const finalValues = object.finalBufferValues


    
    setPipeline(pipeline)
    TableApp.resizeCanvas()

    const verticesToWrite = new Float32Array(finalValues.vertices)
    const facesToWrite = new Uint16Array(finalValues.faces)
    const mvpToWrite = formBuffInfo.finalMvpValues;

    const verticeStorage = engine.addBuffer("Vertex Buffer", verticesToWrite.byteLength, "Vertex") // index 0
    const bunnyDexBuff = engine.addBuffer("Index Buffer", facesToWrite.byteLength, "Index") // index 1
    const bunnyFormBuff = engine.addBuffer("Matrix Uniform", mvpToWrite.byteLength, "Uniform")

    engine.toWriteToBuff.push(texToWrite)
    engine.toWriteToBuff.push(dexToWrite)
    engine.toWriteToBuff.push(formToWrite)

    engine.addBindGroup("uniform MVP matrix bind group", bunnyFormBuff.buffer)

    engine.renderPassDescriptor.colorAttachments[0].view = client.context.getCurrentTexture().createView();

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

    render(engine, Bunny)
}


main()