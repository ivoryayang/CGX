// Class definition for a Bezier Curve
var BezierCurve = function(canvasId, ctx)
{
	// Setup all the data related to the actual curve.
	this.nodes = new Array();
	this.showControlPolygon = true;
	this.showAdaptiveSubdivision = false;
	this.tParameter = 0.5;
	this.tDepth = 2;

	// Set up all the data related to drawing the curve
	this.cId = canvasId;
	this.dCanvas = document.getElementById(this.cId);
	if (ctx) {
		this.ctx = ctx;
		return;
	} else {
		this.ctx = this.dCanvas.getContext('2d');
	}
	this.computeCanvasSize();

	// Setup event listeners
	this.cvState = CVSTATE.Idle;
	this.activeNode = null;

	// closure
	var that = this;

	// Event listeners
	this.dCanvas.addEventListener('resize', this.computeCanvasSize());

	this.dCanvas.addEventListener('mousedown', function(event) {
        that.mousePress(event);
    });

	this.dCanvas.addEventListener('mousemove', function(event) {
		that.mouseMove(event);
	});

	this.dCanvas.addEventListener('mouseup', function(event) {
		that.mouseRelease(event);
	});

	this.dCanvas.addEventListener('mouseleave', function(event) {
		that.mouseRelease(event);
	});
}

BezierCurve.prototype.setT = function(t)
{
	this.tParameter = t;
}

BezierCurve.prototype.setDepth = function(d)
{
	this.tDepth = d;
}

BezierCurve.prototype.setShowControlPolygon = function(bShow)
{
	this.showControlPolygon = bShow;
}

BezierCurve.prototype.setShowAdaptiveSubdivision = function(bShow)
{
	this.showAdaptiveSubdivision = bShow;
}

BezierCurve.prototype.mousePress = function(event)
{
	if (event.button == 0) {
		this.activeNode = null;
		var pos = getMousePos(event);

		// Try to find a node below the mouse
		for (var i = 0; i < this.nodes.length; i++) {
			if (this.nodes[i].isInside(pos.x,pos.y)) {
				this.activeNode = this.nodes[i];
				break;
			}
		}
	}

	// No node selected: add a new node
	if (this.activeNode == null) {
		this.addNode(pos.x,pos.y);
		this.activeNode = this.nodes[this.nodes.length-1];
	}

	this.cvState = CVSTATE.SelectPoint;
	event.preventDefault();
}

BezierCurve.prototype.mouseMove = function(event) {
	if (this.cvState == CVSTATE.SelectPoint || this.cvState == CVSTATE.MovePoint) {
		var pos = getMousePos(event);
		this.activeNode.setPos(pos.x,pos.y);
	} else {
		// No button pressed. Ignore movement.
	}
}

BezierCurve.prototype.mouseRelease = function(event)
{
	this.cvState = CVSTATE.Idle; this.activeNode = null;
}

BezierCurve.prototype.computeCanvasSize = function()
{
	var renderWidth = Math.min(this.dCanvas.parentNode.clientWidth - 20, 820);
    var renderHeight = Math.floor(renderWidth*9.0/16.0);
    this.dCanvas.width = renderWidth;
    this.dCanvas.height = renderHeight;
}

BezierCurve.prototype.drawControlPolygon = function()
{
	for (var i = 0; i < this.nodes.length-1; i++)
		drawLine(this.ctx, this.nodes[i].x, this.nodes[i].y,
					       this.nodes[i+1].x, this.nodes[i+1].y);
}

BezierCurve.prototype.drawControlPoints = function()
{
	for (var i = 0; i < this.nodes.length; i++)
		this.nodes[i].draw(this.ctx);
}

BezierCurve.prototype.deCasteljauSplit = function(t)
{
	// split the curve recursively and call the function
	var left = new BezierCurve(this.cId, this.ctx);
	var right = new BezierCurve(this.cId, this.ctx);


// ################ Edit your code below
	// TODO: Task 1 - Split this curve at parameter location 't' into two new curves
    //                using the De Casteljau algorithm
    // A few useful notes:
    // You can get the current control points using this.nodes
    // For a degree 2 curve there are 3 control points (this.nodes[0], this.nodes[1], this.nodes[2]); for a degree 3 curve, there are 4 control points
    // To do a De Casteljau split, you need to create several new control points by interpolating between existing control points
    // You then need to add these control points to the left- and right- split curve
    // To linearly interpolate between two points at parameter s, use
    
    // var newNode = Node.lerp(a, b, s);
    
    // Your code will look similar to
    
    // var p00 = this.nodes[0];
    // var p01 = this.nodes[1];
    // ....
    
    // var p10 = Node.lerp(p00, p01, ....)
    // var p11 = ......
    // ......
    
    // left.nodes.push(....);
    // right.nodes.push(....);

	// Check if quadratic
	if (this.nodes.length == 3)
	{
		var p00 = this.nodes[0];
		var p01 = this.nodes[1];
		var p02 = this.nodes[2];

		// Calculate immediate control points
		var p10 = Node.lerp(p00, p01, t);
		var p11 = Node.lerp(p01, p02, t);

		var last_lerp = Node.lerp(p10, p11, t);

		// Update left and right split nodes
		left.nodes.push(p00);
		left.nodes.push(p10);
		left.nodes.push(last_lerp);
		
        right.nodes.push(last_lerp);
		right.nodes.push(p11);
		right.nodes.push(p02);

	}

	// Check if cubic
	else if (this.nodes.length == 4)
	{
		var p00 = this.nodes[0];
		var p01 = this.nodes[1];
		var p02 = this.nodes[2];
		var p03 = this.nodes[3];

		// Calculate immediate control points
		var p10 = Node.lerp(p00, p01, t);
		var p11 = Node.lerp(p01, p02, t);
		var p12 = Node.lerp(p02, p03, t);

		var p20 = Node.lerp(p10, p11, t);
		var p21 = Node.lerp(p11, p12, t);

		var last_lerp = Node.lerp(p20, p21, t);

		// Update left and right split nodes
		left.nodes.push(p00);
		left.nodes.push(p10);
		left.nodes.push(p20);
		left.nodes.push(last_lerp);
		
        right.nodes.push(p03);
		right.nodes.push(p12);
		right.nodes.push(p21);
		right.nodes.push(last_lerp);

	}
// ################

	return {left: left, right: right};
}

BezierCurve.prototype.deCasteljauDraw = function(depth)
{

// ################ Edit your code below
	// TODO: Task 2 - Implement a De Casteljau draw function.
    
    // While depth is positive, split the curve in the middle (using this.deCasteljauSplit(0.5))
    // Then recursively draw the left and right subcurve, with parameter depth-1
    // When depth reaches zero, you can approximate the curve with its control polygon
    // you can draw the control polygon with this.drawControlPolygon();
// ################

	// When depth reaches zero, draw control polygon
	// This approximates the curve
	if (depth == 0) {
		this.drawControlPolygon();
	} else if (depth > 0 ) {
		var {left, right} = this.deCasteljauSplit(0.5);
		// Recursively draw left subcurve
		left.deCasteljauDraw(depth - 1);
		// Recursively draw right subcurve
		right.deCasteljauDraw(depth - 1);
	}
}

BezierCurve.prototype.adapativeDeCasteljauDraw = function()
{
	setColors(this.ctx,'red');
	// TODO: Task 3 - Implement the adaptive De Casteljau draw function
	// NOTE: Only for graduate students
    // Compute a flatness measure.
    // If not flat, split and recurse on both
    // Else draw control vertices of the curve
	t= 0.5;
	if (this.nodes.length == 3) {
		// Extract x coordinates of control points
		var p00 = this.nodes[0];
		var p01 = this.nodes[1];
		var p02 = this.nodes[2];

		// 		// Calculate immediate control points
		var p10 = Node.lerp(p00, p01, t);
		var p11 = Node.lerp(p01, p02, t);

		var p20 = Node.lerp(p10, p11, t);
		
		// take the ratio of length (p01 - p20) / (p10-11)
		// var lengthP01P20 = (p01-p20));
		var lengthP01P20 = Math.sqrt(((p01.x - p20.x) * (p01.x - p20.x)) + ((p01.y-p20.y) * (p01.y-p20.y)));
		// var lengthP10P11 = Node.distance(p10, p11);
		var lengthP10P11 = Math.sqrt(((p10.x - p11.x) * (p10.x - p11.x)) + ((p10.y-p11.y) * (p10.y-p11.y)));

		var flatness = lengthP01P20 / lengthP10P11;


		// If flat, draw control polygon / control points
		if (flatness < 0.05) {
			this.drawControlPolygon();
			this.drawControlPoints();
			if (this.VisualizeP) {
				this.drawControlPoints();
			}
		// If not flat, split curve
		// Recursively draw both subcurves
		} else {
			
			var split = this.deCasteljauSplit(0.5);
			split.left.VisualizeP = this.VisualizeP;
			split.left.adapativeDeCasteljauDraw();
			split.right.VisualizeP = this.VisualizeP;
			split.right.adapativeDeCasteljauDraw();
		}
	}
	if (this.nodes.length == 4) {
		// Extract x coordinates of control points
		var x0 = this.nodes[0].x;
		var x1 = this.nodes[1].x;
		var x2 = this.nodes[2].x;
		var x3 = this.nodes[3].x;

		// Extract y coordinates of control points
		var y0 = this.nodes[0].y;
		var y1 = this.nodes[1].y;
		var y2 = this.nodes[2].y;
		var y3 = this.nodes[3].y;

		// Compute distances between adjacent control points
		var d01 = Math.sqrt((x0-x1)*(x0-x1) + (y0-y1)*(y0-y1));
		var d12 = Math.sqrt((x1-x2)*(x1-x2) + (y1-y2)*(y1-y2));
		var d23 = Math.sqrt((x2-x3)*(x2-x3) + (y2-y3)*(y2-y3));
		var d03 = Math.sqrt((x0-x3)*(x0-x3) + (y0-y3)*(y0-y3));

		// Set flatness threshold
		var flatness = 1.01;

		// Check if curve is flat (within specified threshold)
		var flat = (d01+d12+d23) < flatness * d03;

		// If flat, draw control polygon / control points
		if (flat) {
			this.drawControlPolygon();
			this.drawControlPoints();
			if (this.VisualizeP) {
				this.drawControlPoints();
			}
		// If not flat, split curve
		// Recursively draw both subcurves
		} else {
			
			var split = this.deCasteljauSplit(0.5);
			split.left.VisualizeP = this.VisualizeP;
			split.left.adapativeDeCasteljauDraw();
			split.right.VisualizeP = this.VisualizeP;
			split.right.adapativeDeCasteljauDraw();
		}
	}
}

// NOTE: Code for task 1
BezierCurve.prototype.drawTask1 = function()
{
	this.ctx.clearRect(0, 0, this.dCanvas.width, this.dCanvas.height);
	if(this.showControlPolygon)
	{
		// Connect nodes with a line
        setColors(this.ctx,'rgb(10,70,160)');
		this.drawControlPolygon();

		// Draw control points
		setColors(this.ctx,'rgb(10,70,160)','white');
		this.drawControlPoints();
	}

	if (this.nodes.length < 3)
		return;

	// De Casteljau split for one time
	var split = this.deCasteljauSplit(this.tParameter);
	setColors(this.ctx, 'red');
	split.left.drawControlPolygon();
	setColors(this.ctx, 'green');
	split.right.drawControlPolygon();

	setColors(this.ctx,'red','red');
	split.left.drawControlPoints();
	setColors(this.ctx,'green','green');
	split.right.drawControlPoints();

	// Draw some random stuff
	drawText(this.ctx, this.nodes[0].x - 20,
					   this.nodes[0].y + 20,
				  	   "t = " + this.tParameter);
}

// NOTE: Code for task 2
BezierCurve.prototype.drawTask2 = function()
{
	this.ctx.clearRect(0, 0, this.dCanvas.width, this.dCanvas.height);

	if (this.showControlPolygon)
	{
		// Connect nodes with a line
        setColors(this.ctx,'rgb(10,70,160)');
		this.drawControlPolygon();

		// Draw control points
		setColors(this.ctx,'rgb(10,70,160)','white');
		this.drawControlPoints();
    }

	if (this.nodes.length < 3)
		return;

	// De-casteljau's recursive evaluation
	setColors(this.ctx,'black');
	this.deCasteljauDraw(this.tDepth);
}

// NOTE: Code for task 3
BezierCurve.prototype.drawTask3 = function()
{
	this.ctx.clearRect(0, 0, this.dCanvas.width, this.dCanvas.height);

	if (this.showControlPolygon)
	{
		// Connect nodes with a line
        setColors(this.ctx,'rgb(10,70,160)');
		this.drawControlPolygon();

		// Draw control points
		setColors(this.ctx,'rgb(10,70,160)','white');
		this.drawControlPoints();
    }

	if (this.nodes.length < 3)
		return;

	// De-casteljau's recursive evaluation
	setColors(this.ctx,'black');
	this.deCasteljauDraw(this.tDepth);

	// adaptive draw evaluation
	if(this.showAdaptiveSubdivision)
		this.adapativeDeCasteljauDraw();
}

// Add a control point to the Bezier curve
BezierCurve.prototype.addNode = function(x,y)
{
	if (this.nodes.length < 4)
		this.nodes.push(new Node(x,y));
}
