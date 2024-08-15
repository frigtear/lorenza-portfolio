// Parsing waveform .obj files
import { Client } from "/static/index.js";

export class Vertex {
    coordinates;
    norms;
    textureCoordinates;
}

export class Model {
    data;
    pathToModel;
    vertices = [];
    verticesSize;
    normals = []; 
    normalsSize;
    textures = [];
    texturesSize;
    totalSize;
    faces = [];
    triangles = [];

   
    matrix = null 

   

    finalBufferValues = null;
    
    constructor(path) {
        this.pathToModel = path;
    }

    async loadFromFile() {

        await fetch(this.pathToModel)
            .then(response => response.text())
            .then(data => {
                this.data = data;
            })
        .catch((error) => {
            console.log(error);
        });
        
        let lines = this.data.split("\n")

        lines.forEach(line => {
            let tokens = line.split(' ')
            const values = tokens.map(token => {
                if (!isNaN(parseFloat(token))) {
                    return parseFloat(token)
                }
                else {
                    return token;
                }
            })
            switch(values[0]){
                case 'v':
                    this.vertices.push(...[values[1], values[2], values[3], 1])
                    break
                case 'vn':
                    this.normals.push(glMatrix.vec3.fromValues(values[1], values[2], values[3]))
                    break
                case 'vt':
                    this.textures.push(glMatrix.vec2.fromValues(values[1], values[2]))
                    break
                case 'f':
                    this.faces.push(...values.slice(1))
                    break
            }
        });

       this.finalBufferValues = {
        vertices : new Float32Array(this.vertices),
        faces : new Uint16Array(this.faces.flat()),
       }

    }
/*
    orthogonalize(width, height){
        const near = 0.1
        const far = 1000
        width /= 2
        height /= 2
        
        let orthoMatrix = glMatrix.mat4.create();
        let orthogonalizedVertices = []
        glMatrix.mat4.ortho(orthoMatrix, -width, width, -height, height, near, far)
        this.vertices.forEach(vertex => {
            let temp = glMatrix.vec4.create()
            glMatrix.vec4.transformMat4(temp, vertex, orthoMatrix)
            orthogonalizedVertices.push(temp);
        })
        this.vertices = orthogonalizedVertices;
        console.log(this.vertices)
    }
    */

    createMatrices(canvas){
        const view = glMatrix.mat4.create();
        const perspective = glMatrix.mat4.create();
        const mvp = glMatrix.mat4.create();

        const eye = glMatrix.vec3.fromValues(0, 5, 5)
        const center = glMatrix.vec3.fromValues(0, 0 ,0)
        const up = glMatrix.vec3.fromValues(0, 1, 0)

        const fovy = Math.PI / 4; 
        const aspect = canvas.width / canvas.height; 
        const near = 0.1;
        const far = 1000;

        glMatrix.mat4.lookAt(view, eye, center, up)
        glMatrix.mat4.perspective(perspective, fovy, aspect, near, far);

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