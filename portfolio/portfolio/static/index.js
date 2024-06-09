// Javascript shared with every app
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

export class WebGpuBuilder{
    clearColor;
    pipeline;
    shaderModule;
    commandBuffer;
    renderPassDescriptor; 
    appName;
    constructor(name) {
        this.clearColor = [0.3, 0.3, 0.3, 1.0] // GRAY
        this.appName = name;
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

    resizeCanvas(client){
        client.canvas.width = window.innerWidth
        client.canvas.height = window.innerHeight
    }

    setPipeline(client){
        const renderPipeline = client.device.createRenderPipeline({
            label:`${this.name} pipeline`,
            layout:'auto',
            vertex:{
                module:this.shaderModule,
                entryPoint:'vs'
            },
            fragment:{
                module:this.shaderModule,
                entryPoint:'fs',
                targets:[{format:client.format}]
            }
        })
        this.pipeline = renderPipeline
    }

    setShaderModule(client, code){
        const module = client.device.createShaderModule({
            label:`${this.name} shader module`,
            code:code
        });
        this.shaderModule = module
    }

    setCommandBuffer(buffer){
        this.commandBuffer = buffer
    }

    run(client) {
        client.device.queue.submit([this.commandBuffer])
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

