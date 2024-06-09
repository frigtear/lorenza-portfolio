// Parsing waveform .obj files

export class Vertex {
    coordinates;
    norms;
    textureCoordinates;
}


export class Model {
    data;
    pathToModel;
    vertices = [];
    normals = []; 
    textures = [];
    faces = [];
    

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
                    this.vertices.push(glMatrix.vec3.fromValues(values[1], values[2], values[3]))
                    break
                case 'vn':
                    this.normals.push(glMatrix.vec3.fromValues(values[1], values[2], values[3]))
                    break
                case 'vt':
                    this.textures.push(glMatrix.vec2.fromValues(values[1], values[2]))
                    break
                case 'f':
                    this.faces.push(glMatrix.vec4.fromValues(values[1], values[2], values[3], values[4]))
                    break
            }
        });
    }

    s


}