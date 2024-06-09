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

export class WebGpuEnvironment{

    constructor(client, pipeline, renderpass, shaderModule, commandBuffer){
        this.client = client
        this.pipeline = pipeline
        this.renderpass = renderpass
        this.shaderModule = shaderModule
        this.commandBuffer = commandBuffer
    }

    render() {
        this.client.device.submit([this.commandBuffer])
    }
}

export async function initializeWebGPU(){

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

