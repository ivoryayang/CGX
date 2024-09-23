// TODO: Implement a shader program to do Lambert and Phong shading
//       in the fragment shader. How you do this exactly is left up to you.
//       You may need multiple uniforms to get all the required matrices
//       for transforming points, vectors and normals.
var PhongVertexSource = `
    uniform mat4 ModelViewProjection;
    uniform mat4 NormalMatrix;
    uniform mat4 ModelMatrix;

    uniform vec3 CameraPosition;
    attribute vec3 Position;
    attribute vec3 Normal;
    varying vec3 WorldPos;
    varying vec3 NormalDir;

    void main() {
// ################ Edit your code below

// ################
    gl_Position = ModelViewProjection * vec4(Position, 1.0);
    WorldPos = (ModelMatrix * vec4(Position, 1.0)).xyz;
    NormalDir = normalize((NormalMatrix * vec4(Normal, 0.0)).xyz);
    }
`;
var PhongFragmentSource = `
    precision highp float;
    const vec3 LightPosition = vec3(4, 1, 4);
    const vec3 LightIntensity = vec3(20);
    const vec3 ka = 0.3*vec3(1, 0.5, 0.5);
    const vec3 kd = 0.7*vec3(1, 0.5, 0.5);
    const vec3 ks = vec3(0.4);
    const float n = 60.0;
    varying vec3 WorldPos;
    varying vec3 NormalDir;
    uniform vec3 CameraPosition ;

    void main() {
// ################ Edit your code below
// ################
    vec3 lightDir = LightPosition - WorldPos;
    vec3 NormallightDir = normalize(lightDir);
    vec3 viewDir = normalize(CameraPosition - WorldPos);
    vec3 halfVector = normalize((lightDir) + (viewDir));


    // Lambertian reflection
    float lambertian = max(dot(normalize(NormalDir), NormallightDir), 0.0);
    vec3 diffuse = (LightIntensity * kd * lambertian) / dot(lightDir, lightDir);

    // Blinn-Phong reflection
    float specAngle = max(dot(normalize(NormalDir), halfVector), 0.0);
    float specular = pow(specAngle, n);
    vec3 specularComponent = LightIntensity * ks * specular/ dot(lightDir, lightDir);

    // Ambient reflection
    vec3 ambient = ka;

    // Final color computation
    vec3 color = ambient + diffuse + specularComponent;
    gl_FragColor = vec4(color, 1.0);//*0.00001+vec4(normalize(CameraPosition), 1.);
    }
`;
var Task3 = function(gl)
{
    this.pitch = 0;
    this.yaw = 0;
    this.sphereMesh = new ShadedTriangleMesh(gl, SpherePositions, SphereNormals, SphereTriIndices, PhongVertexSource, PhongFragmentSource);
    this.cubeMesh = new ShadedTriangleMesh(gl, CubePositions, CubeNormals, CubeIndices, PhongVertexSource, PhongFragmentSource);
    gl.enable(gl.DEPTH_TEST);
}
Task3.prototype.render = function(gl, w, h)
{
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    var projection = Matrix.perspective(45, w/h, 0.1, 100);
    var view = Matrix.rotate(-this.yaw, 0, 1, 0).multiply(Matrix.rotate(-this.pitch, 1, 0, 0)).multiply(Matrix.translate(0, 0, 5)).inverse();
    var rotation = Matrix.rotate(Date.now()/25, 0, 1, 0);
    var cubeModel = Matrix.translate(-1.8, 0, 0).multiply(rotation);
    var sphereModel = Matrix.translate(1.8, 0, 0).multiply(rotation).multiply(Matrix.scale(1.2, 1.2, 1.2));
    this.sphereMesh.render(gl, sphereModel, view, projection);
    this.cubeMesh.render(gl, cubeModel, view, projection);
}
Task3.prototype.dragCamera = function(dx, dy)
{
    this.pitch = Math.min(Math.max(this.pitch + dy*0.5, -90), 90);
    this.yaw = this.yaw + dx*0.5;
}