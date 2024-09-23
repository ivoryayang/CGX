// Define a WireframeMesh constructor function
// Parameters: Vertex positions, indices
var WireframeMesh = function(vertexPositions, indices)
{
    // Store as properties of object
    this.positions = vertexPositions;
    this.indices = indices;
}

// Add vertex method to WireframeMesh prototype
// This helps to retrieve the vertex at a given index
WireframeMesh.prototype.vertex = function(index)
{
    // Return array representing xyz components of vertex at specified index
    return [this.positions[3*index], this.positions[3*index+1], this.positions[3*index+2]];
}

// Add render method
// Renders wireframe on 2D canvas
WireframeMesh.prototype.render = function(canvas)
{
    // 2D rendering context of canvas
    var context = canvas.getContext('2d');
    context.beginPath();

    // Iterate over indices array in pairs
    // This creates line segments
    for (var i = 0; i < this.indices.length; i+=2)
    {
        // Retrieve indices for current line segment
        var index1 = this.indices[i];
        var index2 = this.indices[i+1];

        // 3D coords of vertices
        var xyz1 = this.vertex(index1);
        var xyz2 = this.vertex(index2);

        // TODO: Implement a simple perspective projection by dividing the x and
        //       y components by the z component.
        //
        // Extract the components using
        //      xyz1[0]    (x-component)
        //      xyz1[1]    (y-component)
        //      xyz1[2]    (z-component)
        //
        // Do the perspective division
        //
        //      var projectedX = .....
        //      var projectedY = .....
        //
        // Assemble projected points
        //
        // var xy1 = [projectedX, projectedY];
        
        // Do the same thing for xyz2 and compute an equivalent
        //
        // var xy2 = [......];
        // 

        // Perspective division (dividing x and y components by z component)
        var projectedX1 = xyz1[0] / xyz1[2];
        var projectedY1 = xyz1[1] / xyz1[2];
        var projectedX2 = xyz2[0] / xyz2[2];
        var projectedY2 = xyz2[1] / xyz2[2];

        

// ################ Edit your code below
        // Orthographic projection, to get you started
        // Assemble projected points
        var xy1 = [projectedX1, projectedY1];
        var xy2 = [projectedX2, projectedY2];
// ################


        // projected points scaled and centered within the canvas
        var aspect = canvas.width/canvas.height;
        var uv1 = [(xy1[0] + 0.5)*canvas.width, (xy1[1] + 0.5 / aspect)*canvas.width];
        var uv2 = [(xy2[0] + 0.5)*canvas.width, (xy2[1] + 0.5 / aspect)*canvas.width];

        // draw the line segment
        context.moveTo(uv1[0], uv1[1]);
        context.lineTo(uv2[0], uv2[1]);
    }

    // Stroke path to render wireframe
    context.stroke();
}

// Define Task1 constructor function
// Initializes through three wireframe meshes
var Task1 = function(canvas) {
    this.mesh1 = new WireframeMesh(Task1_WireCubePositionsOne, WireCubeIndices);
    this.mesh2 = new WireframeMesh(Task1_WireCubePositionsTwo, WireCubeIndices);
    this.mesh3 = new WireframeMesh(Task1_SpherePositions, SphereIndices);
}

// Add render method to Task 1 prototype
// Renders wireframes meshes onto canvas
Task1.prototype.render = function(canvas, gl, w, h) {
    var context = canvas.getContext('2d');
    // Clear canvas before rendering
    clear(context, w, h);
    
    // Render each wireframe mesh
    this.mesh1.render(canvas);
    this.mesh2.render(canvas);
    this.mesh3.render(canvas);
}

// Add dragCamera method
// For potential future camera manipulation
Task1.prototype.dragCamera = function(dy) {}