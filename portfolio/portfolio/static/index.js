//import { Model } from "/static/parser.js"


// Generic webgpu app, javascript that is loaded into every app

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


    setPipeline(){
        const renderPipeline = this.client.device.createRenderPipeline({
            label:`${this.name} pipeline`,
            layout:'auto',
            vertex:{
                module:this.shaderModule,
                entryPoint:'vs'
            },
            fragment:{
                module:this.shaderModule,
                entryPoint:'fs',
                targets:[{format:this.client.format}]
            }
        })
        this.pipeline = renderPipeline
    }


    setShaderModule(code){
        const module = this.client.device.createShaderModule({
            label:`${this.name} shader module`,
            code:code
        });
        this.shaderModule = module
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

