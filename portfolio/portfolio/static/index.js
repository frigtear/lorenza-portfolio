//import { Model } from "/static/parser.js"


// A Generic webgpu application, that is loaded into every website page

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


export class WebGpuApp{

    clearColor;
    pipeline;
    shaderModule;
    commandBuffer;
    renderPassDescriptor; 
    appName;
    client;
    models = {}; 
    buffers = [];
    toWriteToBuff = [];
    bindGroups = [];
    
    constructor(name, client) {
        this.clearColor = [0.3, 0.3, 0.3, 1.0] // GRAY
        this.appName = name;
        this.client = client;
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

    addStorageBuffer(name, size){
        const buffer = this.client.device.createBuffer({
            label:name,
            size:size,
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST
        }) 

        const bufferInfo  = {
            type:'storage',
            name:name,
            buffer:buffer,
            index:this.buffers.length
        }

        this.buffers.push(bufferInfo)

        return bufferInfo
    }

    addVertexBuffer(name, size){
        const buffer = this.client.device.createBuffer({
            label:name,
            size:size,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
        }) 

        const bufferInfo  = {
            type:'vertex',
            name:name,
            buffer:buffer,
            index:this.buffers.length
        }

        this.buffers.push(bufferInfo)

        return bufferInfo
    }

    addIndexBuffer(name, size){
        const buffer = this.client.device.createBuffer({
            label:name,
            size:size,
            usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST
        }) 

        const bufferInfo  = {
            type:'index',
            name:name,
            buffer:buffer,
            index:this.buffers.length
        }

        this.buffers.push(bufferInfo)

        return bufferInfo
    }

    addUniformBuffer(name, size){
        const buffer = this.client.device.createBuffer({
            label:name,
            size:size,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
        }) 

        const bufferInfo  = {
            type:'uniform',
            name:name,
            buffer:buffer,
            index:this.buffers.length
        }

        this.buffers.push(bufferInfo)

        return bufferInfo
    }

    
    addBindGroup(name, ...resources){

        const entries = resources.map((resource, index) => ({
            binding: index,
            resource: resource
        }));    

        const bindGroup = this.client.device.createBindGroup({
            label:name,
            layout:this.pipeline.getBindGroupLayout(0),
            entries: entries
        })
        
        const bindGroupInfo = {
            name:name,
            bindGroup:bindGroup,
            index:this.bindGroups.length
        }

        this.bindGroups.push(bindGroup)

        return bindGroupInfo
    }

    writeBuffers(){
        for (const buff of this.toWriteToBuff) {
            const buffer = this.buffers[buff.index];
            this.client.device.queue.writeBuffer(buffer, 0, this.toWriteToBuff[buff.index])
        }
    }

    getBuffer(name){
        return this.buffers.filter(buffer => buffer.name == name);
    }


    run() {
        this.client.device.queue.submit([this.commandBuffer])
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

