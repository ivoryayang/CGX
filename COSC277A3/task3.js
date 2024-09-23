function sharpDivision(vertices, faces) {

    var newVertices = [];
    var newFaces = [];
    var edgeMap = {};

    // This function tries to insert the centroid of the edge between
    // vertices a and b into the newVertices array.
    // If the edge has already been inserted previously, the index of
    // the previously inserted centroid is returned.
    // Otherwise, the centroid is inserted and its index returned.
    function getOrInsertEdge(a, b, centroid) {
        var edgeKey = a < b ? a + ":" + b : b + ":" + a;
        if (edgeKey in edgeMap) {
            return edgeMap[edgeKey];
        } else {
            var idx = newVertices.length;
            newVertices.push(centroid);
            edgeMap[edgeKey] = idx;
            return idx;
        }
    }

    for (var i = 0; i < vertices.length; ++i) {
        newVertices.push(vertices[i].clone());
    }

    for (var i = 0; i < faces.length; ++i) {
        var face = faces[i];

        var facePointIndex = newVertices.length;
        var sum = new Vector(0,0,0);
        for (var j = 0; j < face.length; ++j) {
            sum = sum.add(vertices[face[j]]);
        }
        var facePoint = sum.divide(face.length);

        newVertices.push(facePoint);
        for (var j = 0; j < face.length; ++j) {
            var v1 = face[j];
            var v0 = face[(j-1 + face.length) % face.length];
            var v2 = face[(j+1) % face.length];
            var centroid_v0_v1 = (vertices[v0].add(vertices[v1])).divide(2);
            var centroid_v1_v2 = (vertices[v1].add(vertices[v2])).divide(2);
            var edgePointA = getOrInsertEdge(v0, v1, centroid_v0_v1);
            var edgePointB = getOrInsertEdge(v1, v2, centroid_v1_v2);
            newFaces.push([facePointIndex, edgePointA, v1, edgePointB]);
        }
    }
    return new Mesh(newVertices, newFaces);
}
var Task3 = function(gl) {
    this.pitch = 0;
    this.yaw = 0;
    this.subdivisionLevel = 0;
    this.selectedModel = 0;
    this.gl = gl;
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    this.baseMeshes = [];
    for (var i = 0; i < 6; ++i)
        this.baseMeshes.push(this.baseMesh(i).toTriangleMesh(gl));
    this.computeMesh();
}
Task3.prototype.setSubdivisionLevel = function(subdivisionLevel) {
    this.subdivisionLevel = subdivisionLevel;
    this.computeMesh();
}
Task3.prototype.selectModel = function(idx) {
    this.selectedModel = idx;
    this.computeMesh();
}
Task3.prototype.baseMesh = function(modelIndex) {
    switch(modelIndex) {
    case 0: return createCubeMesh(); break;
    case 1: return createTorus(8, 4, 0.5); break;
    case 2: return createSphere(4, 3); break;
    case 3: return createIcosahedron(); break;
    case 4: return createOctahedron(); break;
    case 5: return extraCreditMesh(); break;
    }
    return null;
}
Task3.prototype.computeMesh = function() {
    var mesh = this.baseMesh(this.selectedModel);
    for (var i = 0; i < this.subdivisionLevel; ++i)
        if (i < 3){
            mesh = sharpDivision(mesh.vertices, mesh.faces);
        }
        mesh = catmullClarkSubdivision(mesh.vertices, mesh.faces);
    this.mesh = mesh.toTriangleMesh(this.gl);
}
Task3.prototype.render = function(gl, w, h) {
    gl.viewport(0, 0, w, h);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    var projection = Matrix.perspective(35, w/h, 0.1, 100);
    var view =
        Matrix.translate(0, 0, -5).multiply(
        Matrix.rotate(this.pitch, 1, 0, 0)).multiply(
        Matrix.rotate(this.yaw, 0, 1, 0));
    var model = new Matrix();
    if (this.subdivisionLevel > 0)
        this.baseMeshes[this.selectedModel].render(gl, model, view, projection, false, true, new Vector(0.7, 0.7, 0.7));
    this.mesh.render(gl, model, view, projection);
}
Task3.prototype.dragCamera = function(dx, dy) {
    this.pitch = Math.min(Math.max(this.pitch + dy*0.5, -90), 90);
    this.yaw = this.yaw + dx*0.5;
}