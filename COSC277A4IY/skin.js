// TODO: Task 2 - Subtask 1
//
// Compute the distance of point `p' to the line segment between `vertex0' and `vertex1'.
//
// Note: You can do this by projecting the point onto the (infinite) line
// and then computing the distance between the projection and the point.
// You need to check whether the projection actually lies within the
// line segment (it might lie outside) - if it doesn't, you need to instead
// return the distance to the closest end point of the segment (i.e. vertex0/vertex1)
function computeDistanceToLine(pt, vertex0, vertex1) {

	// Vector from vertex 0 to pt
	var p_s1 = pt.subtract(vertex0);
	// Vector from vertex 0 to 1
	var s2_s1 = vertex1.subtract(vertex0);
	// Square of length of line segment
	var sqr_length = s2_s1.length()*s2_s1.length();
	// Dot product of (pt - vertex0) and (vertex1 - vertex0)
	var dotProduct = p_s1.dot(s2_s1);
	// Parameter along the line segment
	var t_hat = dotProduct / sqr_length;
	// Parameter clamped between 0 and 1
	var t_star = Math.min(Math.max(t_hat, 0), 1);
	// Closest point on the line segment to pt
	var s = vertex0.add(s2_s1.multiply(t_star));
	// Distance between pt and the closest point on the line segment
	var distance = (s.subtract(pt)).length();

	return distance;
}

// SkinMesh represents a triangle mesh that will be skinned with a skeleton.
var SkinMesh = function (gl) {

	// Original (undeformed) mesh data
	this.mOriginalPositions = new Array();
	this.mIndices = new Array();

	// The transformed (skinned) vertex positions
	this.mTransformedPositions = new Array();

	// Weights for each vertex and bone combination
	this.mWeights = new Array();

	// The skin does not have a skeleton initially bound to it.
	// Once the skin has a skeleton bound to it, the corresponding
	// binding matrices for each joint have to be computed.
	this.mSkeleton = null;

	this.gl = gl;

	// Flag to toggle weight display 
	this.mShowWeights = false;

	// The current selected joint for showing weights.
	// This is set by selecting the appropriate joint button in the UI.
	this.mWeightJoint = null;

	// An array that is used to store the weights of the selected joint
	this.mSelectedJointWeights = null;

	// The mesh that draws the weights of the selected joint.
	this.mWeightMesh = null;

	// The actual mesh of the transformed skin.
	this.mMesh = null;

	// Stores the current skinning mode
	this.mSkinMode = null;

	// Various shaders
	this.shader = createShaderProgram(gl, SolidVertexSource, SolidFragmentSource);
	this.wShader = createShaderProgram(gl, WeightVertexSource, WeightFragmentSource);
}

// Helper function to retrieve the weight of a vertex with respect to a particular joint
SkinMesh.prototype.getVertexWeight = function (idx, joint) {
	var numJoints = this.mSkeleton.getNumJoints();
	return this.mWeights[idx * numJoints + joint];
}

// Helper function to set the weight of a vertex with respect to a particular joint
SkinMesh.prototype.setVertexWeight = function (idx, joint, weight) {
	var numJoints = this.mSkeleton.getNumJoints();
	this.mWeights[idx * numJoints + joint] = weight;
}

// Helper function to return the number of vertices in the current mesh
SkinMesh.prototype.getNumVertices = function () {
	return this.mOriginalPositions.length / 3;
}

// Helper method to get a vertex with 'id'
SkinMesh.prototype.getVertex = function (idx) {
	return new Vector(this.mOriginalPositions[idx * 3 + 0], this.mOriginalPositions[idx * 3 + 1], this.mOriginalPositions[idx * 3 + 2]);
}

// Helper method to set a transformed vertex into the correct location.
SkinMesh.prototype.setTransformedVertex = function (idx, vtx) {
	this.mTransformedPositions[idx * 3 + 0] = vtx.x;
	this.mTransformedPositions[idx * 3 + 1] = vtx.y;
	this.mTransformedPositions[idx * 3 + 2] = vtx.z;
}

// Returns the joint for which the vertex has a weight 1.
// Essentially returning the rigid joint.
SkinMesh.prototype.getRigidlyAttachedJoint = function (id) {
	var numJoints = this.mSkeleton.getNumJoints();
	for (var b = 0; b < numJoints; b++)
		if (this.mWeights[id * numJoints + b] == 1)
			return this.mSkeleton.getJoint(b);
}

// NOTE: This function computes fixed weights only for the cylinder mesh
//       Don't use this function for other meshes. It assumes there are only two joints
// 		 as indicated in the assignment.
SkinMesh.prototype.computeRigidWeights = function () {
	if (this.mSkeleton) {
		for (var i = 0; i < this.getNumVertices(); i++) {
			var pos = this.getVertex(i);

			if (pos.x < 0.0) {
				// Give full weight to joint #0
				this.setVertexWeight(i, 0, 1.0);
				this.setVertexWeight(i, 1, 0.0);
			} else {
				// Give full weight to joint #1
				this.setVertexWeight(i, 0, 0.0);
				this.setVertexWeight(i, 1, 1.0);
			}
		}
	} else {
		console.log("No skeleton bound to skin");
	}
}

// TODO: Task 1 - Subtask 2
// Implement rigid skinning
SkinMesh.prototype.rigidSkinning = function () {
	// Pseudo code for this task:

	// For all vertices in the mesh      (Hint: use getNumVertices())
	// Get rigid joint for vertex (Hint: use getRigidlyAttachedJoint)
	// Compute bone transform     (Hint: use joint.getWorldMatrix and
	//                                   and joint.getBindingMatrix
	//                                   The bone transform should transform the (unskinned) vertex position
	//                                   into the local space of the bone when it was bound (i.e. using the binding matrix)
	//                                   and then back into world space using the current bone transform (i.e. using the world matrix)
	// Transform vertex using the bone transform (Hint: You can use this.getVertex() and Matrix.transformPoint())
	// Update the transformed vertex position in the mesh (Hint: Use setTransformedVertex)

	if (this.mSkeleton) {

		console.log("TODO: Add your rigid skinning code here")
		
		// Loops through all vertices in the mesh
		for (var i = 0 ; i < this.getNumVertices() ; i++) {
			// Get position of current matrix
			var pos = this.getVertex(i);
			// Get rigid joint for vertex
			var joint = this.getRigidlyAttachedJoint(i);
			// Binding matrix of joint
			var bind_m = joint.getBindingMatrix();
			// World matrix of joint
			var local2world = joint.getWorldMatrix();
			// Transform vertex from original space to local space
			var bind_pos = bind_m.transformPoint(pos);
			// Transform from local space back to world space
			var world_pos = local2world.transformPoint(bind_pos);
			// Update transformed vertex position in mesh
			this.setTransformedVertex(i, world_pos);
		}
	} else {
		console.log("No skeleton bound with skin");
	}
}

// TODO: Task 2 - Subtask 2
//
// Compute smoothly blended vertex weights
SkinMesh.prototype.computeLinearBlendedWeights = function () {
	// Pseudo code for this task:
	// For all vertices in the mesh
	// For all joints in the skeleton (Hint: use this.mSkeleton.getNumJoints())
	// Get world space positions of the joint (Hint: use this.mSkeleton.getJoint()
	//                                               and joint.getJointEndPoints())
	// Compute distance between world space vertex location and joint using computeDistanceToLine
	// Set the vertex weight to 1/distance^4 (Hint: use setVertexWeight)

	// The vertex weights are not yet normalized, so you need to do a second pass:
	// Sum all of the weights that you just computed for this vertex
	// (you can loop over all joints again and use this.getVertexWeight)

	// Loop over all joints again and set the vertex weight to the current vertex
	// weight divided by the sum of vertex weights
	// Now your vertex weights should sum to one!

	var weight_all = [];

	// Check if skeleton is bound to skin
    if (this.mSkeleton) {
		console.log("Todo : Add your linear blended weights computation here.");

		// Loop through all vertices
		for (var i = 0 ; i <  this.getNumVertices(); i++) {
			// Initialize sum of weights for current vertex
			weight_all.push(0.0);
			// Loop through all joints
			for (var j = 0 ; j < this.mSkeleton.getNumJoints() ; j++) {
				// Get current joint and end points
				var joint = this.mSkeleton.getJoint(j);
				var joint_v0v1 = joint.getJointEndPoints();

				// World space position of vertex
				var pos = this.getVertex(i);

				// Transform vertex position to joint's binding matrix and world matrix
				var bind_m = joint.getBindingMatrix();
				var local2world = joint.getWorldMatrix();
				var bind_pos = bind_m.transformPoint(pos);
				var world_pos = local2world.transformPoint(bind_pos);
				
				// Distance between vertex and joint
				var distance = computeDistanceToLine(world_pos, joint_v0v1.v0, joint_v0v1.v1);
				// Set vertex weight to 1/distance^4
				var weight = 1/(distance*distance*distance*distance);
				this.setVertexWeight(i, j, weight);
				// Accumulate weight for normalization
				weight_all[i] += weight;
			}
		}

		// Normalize weights 
		for (var i = 0 ; i < this.getNumVertices() ; i++) {
			for (var j = 0 ; j < this.mSkeleton.getNumJoints() ; j++) {
				// Get current weight
				var curr_weight = this.getVertexWeight(i, j);
				// Normalize by dividing by sum of weights for vertex
				this.setVertexWeight(i, j, curr_weight / weight_all[i]);
			}
		}
	} else {
		console.log("No skeleton bound with skin");
	}
}

// TODO: Task 2 - Subtask 3
// Implement linear blended skinning
SkinMesh.prototype.linearBlendSkinning = function () {
	// For all vertices in the mesh
	// currentPos = getVertex(...)
	// transformedPos = 0
	// For all joints in the skeleton
	// Get weight of joint for this vertex
	// transformedVertexForBone = Compute transformed vertex position for this vertex and bone, just like earlier
	// transformedPos += weight * transformedVertexForBone
	// Update the transformed vertex position in the mesh (Hint: Use setTransformedVertex)

	if (this.mSkeleton) {
		console.log("TODO: add your linear blended skinning code here.");

		for (var i = 0 ; i < this.getNumVertices() ; i++) {
			// Get current position of vertex in bind pose
			var currentPos = this.getVertex(i);
			// Initialize transformed position for vertex
			var transformedPos = new Vector(0, 0, 0);
			// Loop through all joints in skeleton
			for (var j = 0 ; j < this.mSkeleton.getNumJoints() ; j++) {
				// Get current joint and binding and world matrices
				var curr_weight = this.getVertexWeight(i, j);
				var joint = this.mSkeleton.getJoint(j);
				var bind_m = joint.getBindingMatrix();
				var local2world = joint.getWorldMatrix();

				// Transform vertex position to joint's binding position
				var bind_pos = bind_m.transformPoint(currentPos);
				// Transform to world space
				var transformedVertexForBone = local2world.transformPoint(bind_pos);
				// Update transformed position
				transformedPos = transformedPos.add(transformedVertexForBone.multiply(curr_weight));
			}
			// Update transformed vertex position in mesh
			this.setTransformedVertex(i, transformedPos);
		}
	} else {
		console.log("No skeleton bound with skin");
	}
}

// Update skin called whenever a change is detected in the joint.
// Typically caused by the UI angle change
// However in case of animations, you can use this function to do the same functionality.
SkinMesh.prototype.updateSkin = function () {
	
	if (this.mSkinMode == "rigid") {
		this.rigidSkinning();

	}
	else if (this.mSkinMode == "linear") {
		this.linearBlendSkinning();
	}

	if (!this.mShowWeights)
		this.mesh = new TriangleMesh(this.gl, this.mTransformedPositions, this.mIndices, this.shader);
	else
		this.mWeightMesh = new WeightShadedTriangleMesh(this.gl, this.mTransformedPositions, this.mSelectedJointWeights, this.mIndices, this.wShader)
}

// Creates a cylinder mesh along the x-axis
SkinMesh.prototype.createCylinderSkinX = function (rad) {
	// Create a cylinder from [-2 : 2]
	var startX = -2.0;
	var endX = 2.0;
	var numXSegments = 16;
	var numThetaBands = 16;
	var factor = (endX - startX) / numXSegments;

	var radius = 1.0;
	if (rad)
		radius = rad;

	// Fill in the position data
	for (var i = 0; i <= numXSegments; i++) {
		for (var j = 0; j < numThetaBands; j++) {
			var theta = 2 * Math.PI * j / numThetaBands;

			var y = radius * Math.sin(theta);
			var z = radius * Math.cos(theta);

			this.mOriginalPositions.push(startX);
			this.mOriginalPositions.push(y);
			this.mOriginalPositions.push(z);

			this.mTransformedPositions.push(startX);
			this.mTransformedPositions.push(y);
			this.mTransformedPositions.push(z);

			// for every band
			if (i < numXSegments) {
				var i0 = i, i1 = i + 1;
				var j0 = j, j1 = (j + 1) % numThetaBands;
				this.mIndices.push(i0 * numThetaBands + j0);
				this.mIndices.push(i0 * numThetaBands + j1);
				this.mIndices.push(i1 * numThetaBands + j1);
				this.mIndices.push(i0 * numThetaBands + j0);
				this.mIndices.push(i1 * numThetaBands + j1);
				this.mIndices.push(i1 * numThetaBands + j0);
			}
		}
		startX = startX + factor;
	}

	// create the mesh
	this.mesh = new TriangleMesh(this.gl, this.mTransformedPositions, this.mIndices, this.shader);
}

SkinMesh.prototype.createArmSkin = function () {
	for (var i = 0; i < armPositions.length; i++) {
		this.mOriginalPositions.push(armPositions[i]);
		this.mTransformedPositions.push(armPositions[i]);

		// Flip it around the x-axis and offset it a little bit
		if ((i % 3) == 0) {
			this.mOriginalPositions[i] = -10.0 - this.mOriginalPositions[i];
			this.mTransformedPositions[i] = -10.0 - this.mTransformedPositions[i];
		}
	}

	// Do zero offsetting for obj file using a '1'-indexing scheme
	for (var i = 0; i < armIndices.length; i++) {
		this.mIndices.push(armIndices[i] - 1);
	}

	// compute only edge segments
	this.newIndices = new Array();

	for (var i = 0; i < armIndices.length / 3; i++) {
		var i0 = this.mIndices[i * 3 + 0];
		var i1 = this.mIndices[i * 3 + 1];
		var i2 = this.mIndices[i * 3 + 2];

		this.newIndices.push(i0);
		this.newIndices.push(i1);
		this.newIndices.push(i1);
		this.newIndices.push(i2);
		this.newIndices.push(i2);
		this.newIndices.push(i0);
	}

	this.mesh = new TriangleMesh(this.gl, this.mTransformedPositions, this.newIndices, this.shader);
}

// Attaches ("binds") a skeleton to the skin.
// Also computes binding matrices and vertex weights.
SkinMesh.prototype.setSkeleton = function (val, mode) {
	this.mSkeleton = val;

	if (this.mSkeleton)
		this.mSkeleton.computeBindingMatrices();

	this.mWeights = new Array(this.getNumVertices() * this.mSkeleton.getNumJoints());

	// We have a skeleton now.
	// We can compute weights for each vertex
	this.mSkinMode = mode;
	if (mode == "linear") {
		this.computeLinearBlendedWeights();
	}
	else {
		this.computeRigidWeights();
	}
}

// Generates the mesh that displays the vertex weights of the selected joint
SkinMesh.prototype.showJointWeights = function (id) {
	this.mShowWeights = id >= 0;
	this.mWeightJoint = id;

	if (this.mShowWeights && this.mSkeleton) {
		// weights was toggled
		// create a new mesh with the correct weights
		this.mSelectedJointWeights = new Array();
		var numJoints = this.mSkeleton.getNumJoints();

		for (var i = 0; i < this.mOriginalPositions.length / 3; i++) {
			// get only weights for the joint selected
			//var temp = this.mWeights[i * numJoints + this.mWeightJoint];
			var temp = this.getVertexWeight(i, this.mWeightJoint);
			this.mSelectedJointWeights.push(temp);
		}

		this.mWeightMesh = new WeightShadedTriangleMesh(this.gl, this.mTransformedPositions, this.mSelectedJointWeights, this.mIndices, this.wShader)
	}
	else {
		console.log("No skeleton bound to compute weights");
	}
}

// Renders a skin mesh with the selected options.
SkinMesh.prototype.render = function (gl, view, projection, drawWireFrame) {
	if (!this.mShowWeights) {
		if (this.mesh) {
			this.mesh.render(gl, new Matrix(), view, projection, drawWireFrame);
		}
	}
	else {
		if (this.mWeightMesh && this.mSkeleton) {
			this.mWeightMesh.render(gl, new Matrix(), view, projection);
		}
	}
}