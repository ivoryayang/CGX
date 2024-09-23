var BSpline = function(canvasId)
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

BSpline.prototype.setShowControlPolygon = function(bShow)
{
	this.showControlPolygon = bShow;
}

BSpline.prototype.setNumSegments = function(val)
{
	this.numSegments = val;
}

BSpline.prototype.mousePress = function(event)
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

BSpline.prototype.mouseMove = function(event) {
	if (this.cvState == CVSTATE.SelectPoint || this.cvState == CVSTATE.MovePoint) {
		var pos = getMousePos(event);
		this.activeNode.setPos(pos.x,pos.y);
	} else {
		// No button pressed. Ignore movement.
	}
}

BSpline.prototype.mouseRelease = function(event)
{
	this.cvState = CVSTATE.Idle; this.activeNode = null;
}

BSpline.prototype.computeCanvasSize = function()
{
	var renderWidth = Math.min(this.dCanvas.parentNode.clientWidth - 20, 820);
    var renderHeight = Math.floor(renderWidth*9.0/16.0);
    this.dCanvas.width = renderWidth;
    this.dCanvas.height = renderHeight;
}

BSpline.prototype.drawControlPolygon = function()
{
	for (var i = 0; i < this.nodes.length-1; i++)
		drawLine(this.ctx, this.nodes[i].x, this.nodes[i].y,
					  this.nodes[i+1].x, this.nodes[i+1].y);
}

BSpline.prototype.drawControlPoints = function()
{
	for (var i = 0; i < this.nodes.length; i++)
		this.nodes[i].draw(this.ctx);
}

BSpline.prototype.draw = function()
{

// ################ Edit your code below
	// TODO: Task 6: Draw the B-Spline curve (see the assignment for more details)
    // Hint: You can base this off of your Catmull-Rom code
// ################
    // Loop through control points for the B-Spline curve
	for (var i = 1 ; i < this.nodes.length-3 ; i++) {
		var x0 = this.nodes[i-1].x;
		var x1 = this.nodes[i].x;
		var x2 = this.nodes[i+1].x;
		var x3 = this.nodes[i+2].x;

		var y0 = this.nodes[i-1].y;
		var y1 = this.nodes[i].y;
		var y2 = this.nodes[i+1].y;
		var y3 = this.nodes[i+2].y;

		// B-Spline
		if (i == 0) {
			var init_X;
			var init_Y;

			// Draw segments for the first part of the curve
			for (var j = 0 ; j <= this.numSegments ; j++) {
				var u = j / this.numSegments;

				// B-Spline basis functions
				// Fix this function
				var b0 = (1-u) * (1-u) * (1-u) / 6;
				var b1 = (3*u*u*u - 6*u*u + 4) / 6;
				var b2 = (-3*u*u*u + 3*u*u + 3*u + 1) / 6;
				var b3 = u * u * u/6;

				// Calculate endpoint coordinates
				var endP_x = b0*x0 + b1*x0 + b2*x0 + b3*x1;
				var endP_y = b0*y0 + b1*y0 + b2*y0 + b3*y1;

				// Draw line segment
				setColors(this.ctx,'black');
				if (j > 0) {
					drawLine(this.ctx, init_X, init_Y, endP_x, endP_y);
					init_X = endP_x;
					init_Y = endP_y;
				}
				// Draw segments for the second part of the curve
				for (var j = 0 ; j <= this.numSegments ; j++) {
					var u = j / this.numSegments;

					// B-Spline basis functions
					var b0 = (1-u) * (1-u) * (1-u) / 6;
					var b1 = (3*u*u*u - 6*u*u + 4) / 6;
					var b2 = (-3*u*u*u + 3*u*u + 3*u + 1) / 6;
					var b3 = u * u * u/6;

					// Calculate endpoint coordinates
					var endP_x = b0*x0 + b1*x0 + b2*x1 + b3*x2;
					var endP_y = b0*y0 + b1*y0 + b2*y1 + b3*y2;

					// Draw line segment
					setColors(this.ctx,'black');
					if (j > 0)
						drawLine(this.ctx, init_X, init_Y, endP_x, endP_y);
					init_X = endP_x;
					init_Y = endP_y;
				}
			}
		}

		if (i == this.nodes.length-4) {
			var init_X;
			var init_Y;

			// Draw segments for the third part of the curve
			for (var j = 0 ; j <= this.numSegments ; j++) {
				var u = j / this.numSegments;

				// B-Spline basis functions
				var b0 = (1-u) * (1-u) * (1-u) / 6;
				var b1 = (3*u*u*u - 6*u*u + 4) / 6;
				var b2 = (-3*u*u*u + 3*u*u + 3*u + 1) / 6;
				var b3 = u * u * u/6;

				// Calculate endpoint coordinates
				var endP_x = b0*x1 + b1*x2 + b2*x3 + b3*x3;
				var endP_y = b0*y1 + b1*y2 + b2*y3 + b3*y3;

				// Draw line segment
				setColors(this.ctx,'black');
				if (j > 0) {
					drawLine(this.ctx, init_X, init_Y, endP_x, endP_y);
					init_X = endP_x;
					init_Y = endP_y;
				}
				for (var j = 0 ; j <= this.numSegments ; j++) {
					var u = j / this.numSegments;

					var b0 = (1-u) * (1-u) * (1-u) / 6;
					var b1 = (3*u*u*u - 6*u*u + 4) / 6;
					var b2 = (-3*u*u*u + 3*u*u + 3*u + 1) / 6;
					var b3 = u * u * u/6;

					var endP_x = b0*x2 + b1*x3 + b2*x3 + b3*x3;
					var endP_y = b0*y2 + b1*y3 + b2*y3 + b3*y3;

					setColors(this.ctx,'black');
					if (j > 0)
						drawLine(this.ctx, init_X, init_Y, endP_x, endP_y);
					init_X = endP_x;
					init_Y = endP_y;
				}
			}
		}
		var startP_x;
		var startP_y;

		for (var j = 0 ; j <= this.numSegments ; j++) {
			var u = j / this.numSegments;

			var b0 = (1-u) * (1-u) * (1-u) / 6;
			var b1 = (3*u*u*u - 6*u*u + 4) / 6;
			var b2 = (-3*u*u*u + 3*u*u + 3*u + 1) / 6;
			var b3 = u * u * u/6;

			var endP_x = b0*x0 + b1*x1 + b2*x2 + b3*x3;
			var endP_y = b0*y0 + b1*y1 + b2*y2 + b3*y3;

			setColors(this.ctx,'black');
			if(j > 0)
				drawLine(this.ctx, startP_x, startP_y, endP_x, endP_y);
			startP_x = endP_x;
			startP_y = endP_y;
		}
	}
}

// NOTE: Task 6 code.
BSpline.prototype.drawTask6 = function()
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

}


// Add a control point to the curve
BSpline.prototype.addNode = function(x,y)
{
	this.nodes.push(new Node(x,y));
}
