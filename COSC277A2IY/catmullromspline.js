var CatmullRomSpline = function(canvasId)
{
	// Set up all the data related to drawing the curve
	this.cId = canvasId;
	this.dCanvas = document.getElementById(this.cId);
	this.ctx = this.dCanvas.getContext('2d');
	this.dCanvas.addEventListener('resize', this.computeCanvasSize());
	this.computeCanvasSize();

	// Setup all the data related to the actual curve.
	this.nodes = new Array();
	this.showControlPolygon = true;
	this.showTangents = true;

	// Assumes a equal parametric split strategy
	this.numSegments = 16;

	// Global tension parameter
	this.tension = 0.5;

	// Setup event listeners
	this.cvState = CVSTATE.Idle;
	this.activeNode = null;

	// closure
	var that = this;

	// Event listeners
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

CatmullRomSpline.prototype.setShowControlPolygon = function(bShow)
{
	this.showControlPolygon = bShow;
}

CatmullRomSpline.prototype.setShowTangents = function(bShow)
{
	this.showTangents = bShow;
}

CatmullRomSpline.prototype.setTension = function(val)
{
	this.tension = val;
}

CatmullRomSpline.prototype.setNumSegments = function(val)
{
	this.numSegments = val;
}

CatmullRomSpline.prototype.mousePress = function(event)
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

CatmullRomSpline.prototype.mouseMove = function(event) {
	if (this.cvState == CVSTATE.SelectPoint || this.cvState == CVSTATE.MovePoint) {
		var pos = getMousePos(event);
		this.activeNode.setPos(pos.x,pos.y);
	} else {
		// No button pressed. Ignore movement.
	}
}

CatmullRomSpline.prototype.mouseRelease = function(event)
{
	this.cvState = CVSTATE.Idle; this.activeNode = null;
}

CatmullRomSpline.prototype.computeCanvasSize = function()
{
	var renderWidth = Math.min(this.dCanvas.parentNode.clientWidth - 20, 820);
    var renderHeight = Math.floor(renderWidth*9.0/16.0);
    this.dCanvas.width = renderWidth;
    this.dCanvas.height = renderHeight;
}

CatmullRomSpline.prototype.drawControlPolygon = function()
{
	for (var i = 0; i < this.nodes.length-1; i++)
		drawLine(this.ctx, this.nodes[i].x, this.nodes[i].y,
					  this.nodes[i+1].x, this.nodes[i+1].y);
}

CatmullRomSpline.prototype.drawControlPoints = function()
{
	for (var i = 0; i < this.nodes.length; i++)
		this.nodes[i].draw(this.ctx);
}

CatmullRomSpline.prototype.drawTangents = function()
{

// ################ Edit your code below
	// TODO: Task 4
    // Compute tangents at the nodes and draw them using drawLine(this.ctx, x0, y0, x1, y1);
	// Note: Tangents are available only for 2,..,n-1 nodes. The tangent is not defined for 1st and nth node.
    // The tangent of the i-th node can be computed from the (i-1)th and (i+1)th node
    // Normalize the tangent and compute a line with a length of 50 pixels from the current control point.
// ################
	var i = 1;
    while (i < this.nodes.length - 1) {
		// Compute tangent from changes in x and y between (i-1)th and (i+i)th node
		var slope_y = this.nodes[i+1].y - this.nodes[i-1].y;
		var slope_x = this.nodes[i+1].x -  this.nodes[i-1].x;

		// Normalize the tangent
		var norm = Math.sqrt(2500/(slope_x*slope_x + slope_y*slope_y));

		// Current control point coordinates
		var x0 = this.nodes[i].x;
		var y0 = this.nodes[i].y;

		// Compute a line with a length of 50 pixels from current control point
		drawLine(this.ctx, x0, y0, x0 + slope_x*norm, y0 + slope_y* norm);
		
		// Move to the next node
		i = i+1;
   }
}

CatmullRomSpline.prototype.draw = function()
{

// ################ Edit your code below
	// TODO: Task 5: Draw the Catmull-Rom curve (see the assignment for more details)
    // Hint: You should use drawLine to draw lines, i.e.
	// setColors(this.ctx,'black');
	// .....
	// drawLine(this.ctx, x0, y0, x1, y1);
	// ....
// ################

    // Start from third control point
	var i = 2;
	// Set drawing color to black
	setColors(this.ctx, 'black');

	// Iterate through control points
	while (i < this.nodes.length-1) {
		// Control point coordinates
		var c0x = this.nodes[i-1].x;
		var c0y = this.nodes[i-1].y;
		// Tension-adjusted slopes between control points
		var c1x = (this.tension)*(this.nodes[i].x - this.nodes[i-2].x);
		var c1y = (this.tension)*(this.nodes[i].y - this.nodes[i-2].y);
		var c2x = 3*(this.nodes[i].x - this.nodes[i-1].x) - (this.tension)*(this.nodes[i+1].x- this.nodes[i-1].x) - 2*(this.tension)*(this.nodes[i].x- this.nodes[i-2].x);
		var c2y = 3*(this.nodes[i].y - this.nodes[i-1].y) - (this.tension)*(this.nodes[i+1].y- this.nodes[i-1].y) - 2*(this.tension)*(this.nodes[i].y- this.nodes[i-2].y);
		var c3x = -2*(this.nodes[i].x - this.nodes[i-1].x) + (this.tension)* (this.nodes[i+1].x - this.nodes[i-1].x) + (this.tension)*(this.nodes[i].x - this.nodes[i-2].x);
		var c3y = -2*(this.nodes[i].y - this.nodes[i-1].y) + (this.tension)* (this.nodes[i+1].y - this.nodes[i-1].y) + (this.tension)*(this.nodes[i].y - this.nodes[i-2].y);
		
		for (let j = 1; j <= this.numSegments; j++) {
			var u1 = j/this.numSegments;
			var u2 = (j-1)/this.numSegments;
			// Calculate coordinates of two points on the curve
			var currx = c0x + c1x*u1 + c2x*u1*u1 + c3x*u1*u1*u1;
			var curry = c0y + c1y*u1 + c2y*u1*u1 + c3y*u1*u1*u1;
			var prevx = c0x + c1x*u2 + c2x*u2*u2 + c3x*u2*u2*u2;
			var prevy = c0y + c1y*u2 + c2y*u2*u2 + c3y*u2*u2*u2;
			// Draw a line segment between two points
			drawLine(this.ctx, prevx, prevy, currx, curry);
		}
		// Move to the next set of control points
		i = i+1;
	}
}

// NOTE: Task 4 code.
CatmullRomSpline.prototype.drawTask4 = function()
{
	// clear the rect
	this.ctx.clearRect(0, 0, this.dCanvas.width, this.dCanvas.height);

    if (this.showControlPolygon) {
		// Connect nodes with a line
        setColors(this.ctx,'rgb(10,70,160)');
        for (var i = 1; i < this.nodes.length; i++) {
            drawLine(this.ctx, this.nodes[i-1].x, this.nodes[i-1].y, this.nodes[i].x, this.nodes[i].y);
        }
		// Draw nodes
		setColors(this.ctx,'rgb(10,70,160)','white');
		for (var i = 0; i < this.nodes.length; i++) {
			this.nodes[i].draw(this.ctx);
		}
    }

	// We need atleast 4 points to start rendering the curve.
    if(this.nodes.length < 4) return;

	// draw all tangents
	if(this.showTangents)
		this.drawTangents();
}

// NOTE: Task 5 code.
CatmullRomSpline.prototype.drawTask5 = function()
{
	// clear the rect
	this.ctx.clearRect(0, 0, this.dCanvas.width, this.dCanvas.height);

    if (this.showControlPolygon) {
		// Connect nodes with a line
        setColors(this.ctx,'rgb(10,70,160)');
        for (var i = 1; i < this.nodes.length; i++) {
            drawLine(this.ctx, this.nodes[i-1].x, this.nodes[i-1].y, this.nodes[i].x, this.nodes[i].y);
        }
		// Draw nodes
		setColors(this.ctx,'rgb(10,70,160)','white');
		for (var i = 0; i < this.nodes.length; i++) {
			this.nodes[i].draw(this.ctx);
		}
    }

	// We need atleast 4 points to start rendering the curve.
    if(this.nodes.length < 4) return;

	// Draw the curve
	this.draw();

	if(this.showTangents)
		this.drawTangents();
}


// Add a control point to the curve
CatmullRomSpline.prototype.addNode = function(x,y)
{
	this.nodes.push(new Node(x,y));
}
