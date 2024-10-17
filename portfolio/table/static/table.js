import { getClient, Client, Engine } from "/static/engine.js";
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

function render_frame(engine, model, settings){
    
    console.log([settings.eyeX, settings.eyeY, settings.eyeZ])

    const mvp = engine.getMvp([settings.eyeX, settings.eyeY, settings.eyeZ], [0, 0, 0])

    engine.writeBuffer(engine.buffers[2].buffer, 0, mvp.buffer)

    const encoder = engine.client.device.createCommandEncoder({
        label:"table encoder",
        });



    const renderPass = encoder.beginRenderPass(engine.renderPassDescriptor);

  //  engine.renderPassDescriptor.colorAttachments[0].view = engine.client.context.getCurrentTexture().createView()

    renderPass.setPipeline(engine.pipeline);

    renderPass.setBindGroup(0, engine.bindGroups[0])
    renderPass.setVertexBuffer(0, engine.buffers[0].buffer)
    renderPass.setIndexBuffer(engine.buffers[1].buffer, 'uint16')
    
    renderPass.drawIndexed(model.model_vertices.faces.length)
    
    renderPass.end()
    const commands = encoder.finish();

    engine.client.device.queue.submit([commands])

    requestAnimationFrame(() => render_frame(engine, model, settings));
}


async function main(){

    const client = await getClient()

    const shape = new Model("/static/models/cube.obj")
    await shape.loadFromFile()

    const eye = glMatrix.vec3.fromValues(4, 6, 2)
    const center = glMatrix.vec3.fromValues(0, 0 ,0)
    const engine = new Engine(client, [0.3, 0.3, 0.3, 0])

    engine.setShaderModule(code)

    const tablePipeline = engine.client.device.createRenderPipeline({
        label:`${engine.name} pipeline`,
        layout:'auto',
        vertex:{
            module:engine.shaderModule,
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

    engine.pipeline = tablePipeline

    engine.resizeCanvas()

    const vertex_buffer = engine.addBuffer("Shape Vertex Buffer", shape.model_vertices.vertices.byteLength, "Vertex") // index 0
    
    engine.writeBuffer(vertex_buffer, 0, shape.model_vertices.vertices)

    const index_buffer = engine.addBuffer("Shape Index Buffer", shape.model_vertices.faces.byteLength, "Index") // index 1
    
    engine.writeBuffer(index_buffer, 0, shape.model_vertices.faces)

    const temp = engine.getMvp([0, 0, 1], [0, 0, 0])
    const mvp_uniform_buffer = engine.addBuffer("Shape Matrix Uniform", temp.byteLength, "Uniform")

    engine.addBindGroup("uniform MVP matrix bind group", mvp_uniform_buffer)

    engine.renderPassDescriptor.colorAttachments[0].view = client.context.getCurrentTexture().createView();

    const settings = {
        eyeX: 2,
        eyeY: 2,
        eyeZ: 2
    }

    const gui = new dat.GUI()
    gui.add(settings, "eyeX", -10, 10)
    gui.add(settings, "eyeY", -10, 10)
    gui.add(settings, "eyeZ", -10, 10)

    requestAnimationFrame(() => render_frame(engine, shape, settings));

}

main()