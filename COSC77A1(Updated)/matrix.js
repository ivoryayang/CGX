/*
    lightgl.js matrix class
    https://github.com/evanw/lightgl.js/

    Copyright (C) 2011 by Evan Wallace

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in
    all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
    THE SOFTWARE.
*/

// Check if environment supports Float32Array
var hasFloat32Array = (typeof Float32Array != 'undefined');

// Construction function for simple matrix
function SimpleMatrix() {
    // Flatten construction arguments into a single array
    var m = Array.prototype.concat.apply([], arguments);
    // If array empty, intialize with 4x4 identity matrix
    if (!m.length) {
        m = [
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1,
        ];
    }
    // Create the 'm' property on the object, using Float32Array if supported, otherwise use the array
    this.m = hasFloat32Array ? new Float32Array(m) : m;
}

SimpleMatrix.prototype = {
  // Calculate inverse of current matrix
  inverse: function() {
    return SimpleMatrix.inverse(this);
  },
  // Transpose current matrix
  transpose: function() {
    return SimpleMatrix.transpose(this);
  },
  // Multiply current matrix by another matrix
  multiply: function(matrix) {
    return SimpleMatrix.multiply(this, matrix);
  },
  // Multiply current matrix by a vector
  multiplyVector: function(vector) {
    return SimpleMatrix.multiplyVector(this, vector);
  }
};

SimpleMatrix.multiply = function(left, right) {
  var matrix = new SimpleMatrix();
  var a = left.m, b = right.m, m = matrix.m;

  m[0] = a[0] * b[0] + a[1] * b[4] + a[2] * b[8] + a[3] * b[12];
  m[1] = a[0] * b[1] + a[1] * b[5] + a[2] * b[9] + a[3] * b[13];
  m[2] = a[0] * b[2] + a[1] * b[6] + a[2] * b[10] + a[3] * b[14];
  m[3] = a[0] * b[3] + a[1] * b[7] + a[2] * b[11] + a[3] * b[15];

  m[4] = a[4] * b[0] + a[5] * b[4] + a[6] * b[8] + a[7] * b[12];
  m[5] = a[4] * b[1] + a[5] * b[5] + a[6] * b[9] + a[7] * b[13];
  m[6] = a[4] * b[2] + a[5] * b[6] + a[6] * b[10] + a[7] * b[14];
  m[7] = a[4] * b[3] + a[5] * b[7] + a[6] * b[11] + a[7] * b[15];

  m[8] = a[8] * b[0] + a[9] * b[4] + a[10] * b[8] + a[11] * b[12];
  m[9] = a[8] * b[1] + a[9] * b[5] + a[10] * b[9] + a[11] * b[13];
  m[10] = a[8] * b[2] + a[9] * b[6] + a[10] * b[10] + a[11] * b[14];
  m[11] = a[8] * b[3] + a[9] * b[7] + a[10] * b[11] + a[11] * b[15];

  m[12] = a[12] * b[0] + a[13] * b[4] + a[14] * b[8] + a[15] * b[12];
  m[13] = a[12] * b[1] + a[13] * b[5] + a[14] * b[9] + a[15] * b[13];
  m[14] = a[12] * b[2] + a[13] * b[6] + a[14] * b[10] + a[15] * b[14];
  m[15] = a[12] * b[3] + a[13] * b[7] + a[14] * b[11] + a[15] * b[15];

  return matrix;
};

// ######################### Assignment starts here. Edit your code below
SimpleMatrix.addMatrix = function(left, right) {
	var matrix = new SimpleMatrix();
	var a = left.m, b = right.m, m = matrix.m;

	for (var i = 0 ; i < 16 ; i++){
		m[i] = a[i] + b[i];
	}

	return matrix;
};

// Scale matrix (0, 5, 10)
// Basically to change size of object along a particular axis
SimpleMatrix.scale = function(x, y, z) {
  var matrix = new SimpleMatrix();
  var m = matrix.m;

  m[0] = x;
  m[5] = y;
  m[10] = z;

  return matrix;
};

// Translation matrix ( 3, 7, 11)
// Used for moving objects
SimpleMatrix.translate = function(x, y, z) {
  var matrix = new SimpleMatrix();
  var m = matrix.m;

  m[3] = x;
  m[7] = y;
  m[11] = z;

  return matrix;
};

// Rotation matrix
// Used to rotate objects in 3d space
SimpleMatrix.rotate = function(a, x, y, z) {
  var matrix = new SimpleMatrix();
  var m = matrix.m;
  // var I = new SimpleMatrix();
  // var W = new SimpleMatrix();
  // var w = w.m;

  // Convert angle a to radians
  var radians = Math.PI / 180 * a;
  // Calculate unit vector and other neccessary values
  var length = Math.sqrt(x * x + y * y + z * z);
  // Cosine of rotation angle
  var c_theta = Math.cos(radians);
  // Sine of rotation angle
  var s_theta = Math.sin(radians);
  var unit_x = x / length;
  var unit_y = y / length;
  var unit_z = z / length;

  // Set elements of rotation matrix
  // Based on formula
  // Note: Code still works if you remove the 0 and 1s
  m[0] = unit_x * unit_x * (1-c_theta) + c_theta;
  m[1] = unit_x * unit_y * (1-c_theta) - unit_z*s_theta;
  m[2] = unit_x * unit_z * (1-c_theta) + unit_y*s_theta;
  m[3] = 0;
  m[4] = unit_x * unit_y * (1-c_theta) + unit_z*s_theta;
  m[5] = unit_y * unit_y * (1-c_theta) + c_theta;
  m[6] = unit_y * unit_z * (1-c_theta) - unit_x*s_theta;
  m[7] = 0;
  m[8] = unit_x * unit_z * (1-c_theta) - unit_y*s_theta;
  m[9] = unit_y * unit_z * (1-c_theta) + unit_x*s_theta;
  m[10] = unit_z * unit_z * (1-c_theta) + c_theta;
  m[11] = 0;
  m[12] = 0;
  m[13] = 0;
  m[14] = 0;
  m[15] = 1;
 
  return matrix;
}

// Result of multiplying a 4x4 vector and a 4 vector
// Used to transform points or vectors via transformation matrices
SimpleMatrix.multiplyVector = function(matrix, vector)
{
    var newVector = [0, 0, 0, 0];
    var m = matrix.m;

// ################ Edit your code below
    // TODO: Implement Matrix Vector multiplication
    // Hint: The input (and output) vector will be in homogeneous 3D coordinates (with 4 components)
// ################
    // 3 rows in a 4x4 matrix - 0, 1, 2
    // 4th component set to 1.0

    newVector[0] = m[0] * vector[0] + m[1] * vector[1] + m[2] * vector[2] + m[3] * 1.0;
    newVector[1] = m[4] * vector[0] + m[5] * vector[1] + m[6] * vector[2] + m[7] * 1.0;
    newVector[2] = m[8] * vector[0] + m[9] * vector[1] + m[10] * vector[2] + m[11] * 1.0;

    return newVector;
}

// Viewport transform
// Normalized device coordinates (NDC) to screen coordinates (SC)
// 3D / 2D pipeline
SimpleMatrix.viewport = function(nx, ny) {
  var matrix = new SimpleMatrix();
  var m = matrix.m;

// ################ Edit your code below
    // TODO: Change the elements of m so that the line below returns a viewport matrix
// ################
  // Use formula
  // Scaling factor (x-axis)
  m[0] = nx / 2;
  // Scaling factor (y-axis)
  m[5] = ny / 2;
  // Scaling factor (z-axis)
  m[10] = 1;
  // Translation (x-axis)
  m[3] = (nx - 1) / 2;
  // Translation (y-axis)
  m[7] = (ny - 1) / 2;
  // Translation (z-axis)
  m[14] = 0;

  return matrix;
}

// ### SimpleMatrix.frustum(left, right, bottom, top, near, far)
//
// Sets up a viewing frustum, which is shaped like a truncated pyramid with the
// camera where the point of the pyramid would be.
SimpleMatrix.frustum = function(l, r, b, t, n, f) {
  var matrix = new SimpleMatrix();
  var m = matrix.m;

// ################ Edit your code below
    // TODO: Change the elements of m so that the line below returns an OpenGL frustum/perspective matrix
// ################
  // Scaling factor for the x-axis based on the near and far planes
  m[0] = 2 * n / (r - l);
  m[1] = 0;
  m[2] = (r + l) / (r - l);
  m[3] = 0;

  m[4] = 0;
  // Scaling factor for the y-axis based on the near and far planes.
  m[5] = 2 * n / (t - b);
  m[6] = (t + b) / (t - b);
  m[7] = 0;
  // No scaling along the z-axis.
  m[8] = 0;
  m[9] = 0;
  // Determines the depth range of the frustum.
  m[10] = -(f + n) / (f - n);
  // Adjusts the depth values based on the near and far planes
  m[11] = -2 * f * n / (f - n);

  m[12] = 0;
  m[13] = 0;
  // Perspective division factor
  m[14] = -1;
  // Homogeneous coordinate
  m[15] = 0;
  
  return matrix;
};

// ######################### Assignment ends here



// ### SimpleMatrix.perspective(fov, aspect, near, far)
//
// A wrapper for SimpleMatrix.frustum. This returns a perspective transform matrix,
// but uses more user-friendly parameters like `fov` specifying the the top-to-bottom
// field of view angle in degrees and `aspect` specifying the width divided by the
// height of your viewport.
SimpleMatrix.perspective = function(fov, aspect, near, far) {
  var y = Math.tan(fov * Math.PI / 360) * near;
  var x = y * aspect;
  return SimpleMatrix.frustum(-x, x, y, -y, near, far);
};

SimpleMatrix.transpose = function(matrix, result) {
  result = result || new SimpleMatrix();
  var m = matrix.m, r = result.m;
  r[0] = m[0]; r[1] = m[4]; r[2] = m[8]; r[3] = m[12];
  r[4] = m[1]; r[5] = m[5]; r[6] = m[9]; r[7] = m[13];
  r[8] = m[2]; r[9] = m[6]; r[10] = m[10]; r[11] = m[14];
  r[12] = m[3]; r[13] = m[7]; r[14] = m[11]; r[15] = m[15];
  return result;
};

// Returns the matrix that when multiplied with `matrix` results in the
// identity matrix. You can optionally pass an existing matrix in `result`
// to avoid allocating a new matrix. This implementation is from the Mesa
// OpenGL function `__gluInvertMatrixd()` found in `project.c`.
SimpleMatrix.inverse = function(matrix, result) {
  result = result || new SimpleMatrix();
  var m = matrix.m, r = result.m;

  r[0] = m[5]*m[10]*m[15] - m[5]*m[14]*m[11] - m[6]*m[9]*m[15] + m[6]*m[13]*m[11] + m[7]*m[9]*m[14] - m[7]*m[13]*m[10];
  r[1] = -m[1]*m[10]*m[15] + m[1]*m[14]*m[11] + m[2]*m[9]*m[15] - m[2]*m[13]*m[11] - m[3]*m[9]*m[14] + m[3]*m[13]*m[10];
  r[2] = m[1]*m[6]*m[15] - m[1]*m[14]*m[7] - m[2]*m[5]*m[15] + m[2]*m[13]*m[7] + m[3]*m[5]*m[14] - m[3]*m[13]*m[6];
  r[3] = -m[1]*m[6]*m[11] + m[1]*m[10]*m[7] + m[2]*m[5]*m[11] - m[2]*m[9]*m[7] - m[3]*m[5]*m[10] + m[3]*m[9]*m[6];

  r[4] = -m[4]*m[10]*m[15] + m[4]*m[14]*m[11] + m[6]*m[8]*m[15] - m[6]*m[12]*m[11] - m[7]*m[8]*m[14] + m[7]*m[12]*m[10];
  r[5] = m[0]*m[10]*m[15] - m[0]*m[14]*m[11] - m[2]*m[8]*m[15] + m[2]*m[12]*m[11] + m[3]*m[8]*m[14] - m[3]*m[12]*m[10];
  r[6] = -m[0]*m[6]*m[15] + m[0]*m[14]*m[7] + m[2]*m[4]*m[15] - m[2]*m[12]*m[7] - m[3]*m[4]*m[14] + m[3]*m[12]*m[6];
  r[7] = m[0]*m[6]*m[11] - m[0]*m[10]*m[7] - m[2]*m[4]*m[11] + m[2]*m[8]*m[7] + m[3]*m[4]*m[10] - m[3]*m[8]*m[6];

  r[8] = m[4]*m[9]*m[15] - m[4]*m[13]*m[11] - m[5]*m[8]*m[15] + m[5]*m[12]*m[11] + m[7]*m[8]*m[13] - m[7]*m[12]*m[9];
  r[9] = -m[0]*m[9]*m[15] + m[0]*m[13]*m[11] + m[1]*m[8]*m[15] - m[1]*m[12]*m[11] - m[3]*m[8]*m[13] + m[3]*m[12]*m[9];
  r[10] = m[0]*m[5]*m[15] - m[0]*m[13]*m[7] - m[1]*m[4]*m[15] + m[1]*m[12]*m[7] + m[3]*m[4]*m[13] - m[3]*m[12]*m[5];
  r[11] = -m[0]*m[5]*m[11] + m[0]*m[9]*m[7] + m[1]*m[4]*m[11] - m[1]*m[8]*m[7] - m[3]*m[4]*m[9] + m[3]*m[8]*m[5];

  r[12] = -m[4]*m[9]*m[14] + m[4]*m[13]*m[10] + m[5]*m[8]*m[14] - m[5]*m[12]*m[10] - m[6]*m[8]*m[13] + m[6]*m[12]*m[9];
  r[13] = m[0]*m[9]*m[14] - m[0]*m[13]*m[10] - m[1]*m[8]*m[14] + m[1]*m[12]*m[10] + m[2]*m[8]*m[13] - m[2]*m[12]*m[9];
  r[14] = -m[0]*m[5]*m[14] + m[0]*m[13]*m[6] + m[1]*m[4]*m[14] - m[1]*m[12]*m[6] - m[2]*m[4]*m[13] + m[2]*m[12]*m[5];
  r[15] = m[0]*m[5]*m[10] - m[0]*m[9]*m[6] - m[1]*m[4]*m[10] + m[1]*m[8]*m[6] + m[2]*m[4]*m[9] - m[2]*m[8]*m[5];

  var det = m[0]*r[0] + m[1]*r[4] + m[2]*r[8] + m[3]*r[12];
  for (var i = 0; i < 16; i++) r[i] /= det;
  return result;
};