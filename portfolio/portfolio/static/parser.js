// Parsing waveform .obj files
//import {glMatrix} from "/static/glmatrix.js"

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

    model_vertices = null;
    
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

        this.model_vertices = {
        vertices : new Float32Array(this.vertices),
        faces : new Uint16Array(this.faces.flat()),
       }

       return this.model_vertices
    }
}