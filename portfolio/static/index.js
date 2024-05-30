// Javascript shared with every app
const notSupportedMessage = "this website is not supported by this browser, please reload this site on another browser" 

function fail(){
    document.body.innerHTML = ''
    alert(notSupportedMessage)
    
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
    const presentationFormat = context.getPreferredCanvasFormat()
    context.configure({
        device,
        format:presentationFormat
    })

    return {canvas, device, context};
    
}