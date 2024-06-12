// creating matrix for projecting 3d coordinates onto a 2d screen

export function createOrthoMatrix(){
    // BOUNDS
    const left = new glMatrix.vec4.fromValues(-1, 0, 0, 1)
    const right = new glMatrix.vec4.fromValues(0, 1, 0, 1)
    const bottom = new glMatrix.vec4.fromValues(0, -1, 0, 1)
    const top = new glMatrix.vec4.fromValues(0, 1, 0, 1)
    const near = new glMatrix.vec4.fromValues(0, 0, -1, 1)
    const far = new glMatrix.vec4.fromValues(0, 0, 1, 1)

  
    return orthoMatrix
}
