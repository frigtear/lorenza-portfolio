//import { Model } from "/static/parser.js"

// Core graphics engine

const notSupportedMessage = "this website is not supported by this browser, please reload this site on another browser" 


function fail(){
    document.body.innerHTML = ''
    alert(notSupportedMessage)
}


export class Client {
    constructor(canvas, device, context, format){
        this.canvas = canvas
        this.device = device
        this.context = context
        this.format = format
    }
}


export class Engine{

    // Config
    clearColor = [0.3, 0.3, 0.3, 1]

    // Keeping track of objects
    client;
    models = {}; 
    buffers = [];
    bindGroups = [];
    pipeline;
    shaderModule;
    renderPassDescriptor; 
    commandBuffer;
    
    // Transformations
    near = 0.1;
    far = 1000;
    up = glMatrix.vec3.fromValues(0, 1, 0);
    fovy = Math.PI / 4; 
    aspect;
    near = 0.1;
    far = 10000;

    constructor(client, clearColor) {
        this.clearColor = clearColor // GRAY
        this.client = client;
        this.aspect = client.canvas.width / client.canvas.height; 
        this.renderPassDescriptor = {
            label:`${this.appName} render pass`,
            colorAttachments: [
                {
                    clearValue: this.clearColor,
                    loadOp: 'clear',
                    storeOp: 'store',
                }
            ]
        }
    }

    resizeCanvas(){
        this.client.canvas.width = window.innerWidth
        this.client.canvas.height = window.innerHeight
        const dpr = window.devicePixelRatio || 1;
        const width = this.client.canvas.clientWidth;
        const height = this.client.canvas.clientHeight;
        if (this.client.canvas.width !== width || this.client.canvas.height !== height) {
            this.client.canvas.width = width;
            this.client.canvas.height = height;
        }
    }

    setShaderModule(code){
        const module = this.client.device.createShaderModule({
            label:`${this.name} shader module`,
            code:code
        });
        this.shaderModule = module
    }
    

    setPipeline(pipeline){
        this.pipeline = pipeline
    }


    addBuffer(name, size, type){
        
        let usage = null

        switch(type){
            case "Storage":
                usage = GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST
                break;
            case "Vertex":
                usage = GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
                break;
            case "Index":
                usage = GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST
                break;
            case "Uniform":
                usage = GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
                break;
            default:
                throw Error("Buffer type does not exist " + type)
        }

        const buffer = this.client.device.createBuffer({
            label:name,
            size:size,
            usage:usage
        })

        const bufferInfo  = {
            type:type,
            name:name,
            buffer:buffer,
            index:this.buffers.length
        }

        this.buffers.push(bufferInfo)
        return buffer
    }

    
    addBindGroup(name, resource){

        const bindGroup = this.client.device.createBindGroup({
            label:name,
            layout:this.pipeline.getBindGroupLayout(0),
            entries: [
                {
                    binding: 0, // Binding index matching the layout
                    resource: {
                        buffer: resource, // The uniform buffer to bind
                    },
                },
            ],
        })
        
        const bindGroupInfo = {
            name:name,
            bindGroup:bindGroup,
            index:this.bindGroups.length
        }

        this.bindGroups.push(bindGroup)

        return bindGroupInfo
    }


    writeBuffer(buffer, data, index){
        if (!buffer.size > index > 0) { throw Error("Writing to buffer out of bounds")}
        this.client.device.queue.writeBuffer(buffer, data, index)
    }
    

    getBuffer(name){
        return this.buffers.filter(buffer => buffer.name == name);
    }


    addModels(model){
        this.models.push(model)
    }


    getMvp(eye, center){
        const view = glMatrix.mat4.create();
        const perspective = glMatrix.mat4.create();
        const mvp = glMatrix.mat4.create();

        glMatrix.mat4.lookAt(view, eye, center, this.up)
        glMatrix.mat4.perspective(perspective, this.fovy, this.aspect, this.near, this.far);
        glMatrix.mat4.multiply(mvp, perspective, view)

        const matrixValues = {
            matPerspective: perspective,
            matView: view,
            matModel: null,
            matMvp: mvp,
            finalMvpValues: new Float32Array(mvp)
        }
        
        this.matrix = matrixValues
        return matrixValues
    }
}



export async function getClient(){

    if (!navigator.gpu){
        fail()
        return;
    }

    const adapter = await navigator.gpu.requestAdapter()
    const device = await adapter.requestDevice()
    const canvas = document.querySelector('#main')
    const context = canvas.getContext('webgpu')
    const presentationFormat = navigator.gpu.getPreferredCanvasFormat()

    context.configure({
        device,
        format:presentationFormat
    })

    return new Client(canvas, device, context, presentationFormat);
}