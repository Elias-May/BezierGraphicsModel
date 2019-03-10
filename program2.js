var canvas;
var gl;

var programId;
var program2dId;
var axisBufferId;

var mode = 0;
var numAngles = 2;
var stepsPerCurve = 4;

var controlPoints = [];
/*controlPoints[0] = vec2(0.1, -1.0);
controlPoints[1] = vec2(0.3, -0.8);
controlPoints[2] = vec2(0.4, -0.4);
controlPoints[3] = vec2(0.45,  0.0);
controlPoints[4] = vec2(0.5,  0.4);
controlPoints[5] = vec2(0.7,  0.8);
controlPoints[6] = vec2(0.9,  1.0);*/
controlPoints[0] = vec2(0.3, -1.0);
controlPoints[1] = vec2(0.3, -0.66);
controlPoints[2] = vec2(0.3, -0.33);
controlPoints[3] = vec2(0.3,  0.0);
controlPoints[4] = vec2(0.3,  0.33);
controlPoints[5] = vec2(0.3,  0.66);
controlPoints[6] = vec2(0.3,  1.0);

var vertex3d = [];
var altitude = 0;
var azimuth = 0;

var xmousepress = 0;
var ymousepress = 0;
var old_azimuth = 0;
var old_altitude = 0;

var fovy = 90;
var aspect = 1;
var near = 1;
var far = -1;

var selectedIndex = -1;

// Binds "on-change" events for the controls on the web page
function initControlEvents() {
    // Use one event handler for both of the shape controls
    document.getElementById("numAngles").onchange =
    document.getElementById("stepsPerCurve").onchange =
        function(e) {
            numAngles = parseFloat(document.getElementById("numAngles").value);
            stepsPerCurve = parseFloat(document.getElementById("stepsPerCurve").value) + 2;
            if (stepsPerCurve % 2 != 0){
              stepsPerCurve ++;
            }

            // Regenerate the vertex data
            buildSurfaceOfRevolution(getControlPoints(), numAngles, stepsPerCurve);
        };
}

//The method that responds to the 'View/Draw' button click to change the mode.
function selectMode() {
    var elem = document.getElementById("myButton1");
    if (elem.value=="View Mode") {
        document.getElementById("demo").innerHTML = "View Mode";
        document.getElementById('anglesDiv').style.visibility = 'visible';
        document.getElementById('stepsDiv').style.visibility = 'visible';
        elem.value = "Draw Mode";
        mode = 1;

        // Regenerate the vertex data
        buildSurfaceOfRevolution(getControlPoints(), numAngles, stepsPerCurve);

    } else {
        document.getElementById("demo").innerHTML = "Draw Mode";
        document.getElementById('anglesDiv').style.visibility = 'hidden';
        document.getElementById('stepsDiv').style.visibility = 'hidden';
        elem.value = "View Mode";
        mode = 0;
    }
}

// ########### Binds events for keyboard and mouse events --- ADD CODE HERE ###########
function initWindowEvents() {

    // Whether or not the mouse button is currently being held down for a drag.
    var mousePressed = false;

    canvas.onmousedown = function(e) {
        // A mouse drag started.
        mousePressed = true;

        // Log where the mouse drag started.
        // (This is an example of how to get the (x,y) coordinates from a mouse event.)
        //console.log('x = ' + (e.clientX - canvas.offsetLeft));
        //console.log('y = ' + (e.clientY - canvas.offsetTop));

        var cx = (e.clientX - canvas.offsetLeft)/canvas.width * 2 - 1;
        var cy = (e.clientY - canvas.offsetTop)/canvas.height * -2 + 1;

        //console.log('cx = ' + cx);
        //console.log('cy = ' + cy);

        // Differentiate between view mode and draw mode
        if (mode == 1) {

            // Handle mouse down for view mode
            xmousepress = e.clientX;
            ymousepress = e.clientY;




        } else {

            // Handle mouse down for draw mode
            for (i = 0; i < controlPoints.length; i++) {
              if (Math.abs(controlPoints[i][0] - cx) < 0.1 && Math.abs(controlPoints[i][1] - cy) < 0.1){
                selectedIndex = i;
              }
            }

        }
    }

    canvas.onmousemove = function(e) {
        if (mousePressed) {
            // Differentiate between view mode and draw mode
            if (mode == 1) {
                // Handle a mouse drag for view mode
                azimuth = old_azimuth + ((e.clientX - xmousepress)/1.5);
                altitude = old_altitude + ((e.clientY - ymousepress)/3);
                if (altitude > 85){
                  altitude = 85;
                }
                if (altitude < -85){
                  altitude = -85;
                }


            } else {
                // Handle a mouse drag for draw mode

                if (selectedIndex != -1){
                  var cx = (e.clientX - canvas.offsetLeft)/canvas.width * 2 - 1;
                  var cy = (e.clientY - canvas.offsetTop)/canvas.height * -2 + 1;
                  controlPoints[selectedIndex] = vec2(cx, cy);
                }


            }
        }
    }

    window.onmouseup = function(e) {
        // A mouse drag ended.
        mousePressed = false;

        // Differentiate between view mode and draw mode
        if (mode == 1) {
            // Handle mouse up for view mode
            old_azimuth = azimuth;
            old_altitude = altitude;


        } else {

            // Handle mouse up for draw mode
            selectedIndex = -1;

        }
    }

    window.onkeydown = function(e) {
        // Log the key code in the console.  Use this to figure out the key codes for the controls you need.
        console.log(fovy);
        if (mode == 1) {
          if (e.keyCode == 188){
            fovy = fovy + 5;
            if (fovy > 175){
              fovy = 175;
            }
          }
          if (e.keyCode == 190){
            fovy = fovy - 5;
            if (fovy < 5){
              fovy = 5;
            }
          }
        }
    }
}

// ########### Function for retrieving control points from "draw" mode --- ADD CODE HERE ###########
function getControlPoints() {


    // ###### Hard-coded list of control points to support incremental development and testing. ######
    // ###### You should replace this with control points retrieved from "draw" mode.           ######


    return controlPoints;
}

// ########### Function for building a surface of revolution from a list of control points ###########
// ########### ADD CODE HERE                                                               ###########

function buildSurfaceOfRevolution(controlPoints, angles, steps) {
    //ar vertices;

    // ###### Hard-coded list of vertices to support incremental development and testing. ######
    // ###### You should replace this with vertices derived from the control points.      ######
    //vertex3d = hardcodedVertices;

    // ###### Update vertex buffer objects --- ADD CODE HERE ######

    var vertexLines = [];
    for (x=0; x < angles; x++){
      vertexLines[x] = [];
      anglefactor = 2*Math.PI*(x/angles);
      for (y=0; y < steps; y++){
        var bez = getBez();
        var control_x = bez[y][0];
        var control_y = bez[y][1];
        var h = vec3(Math.cos(anglefactor)*control_x, control_y, Math.sin(anglefactor)*control_x)
        vertexLines[x].push(h)
      }
    }
    //console.log("vlines:")
    //console.log(vertexLines);

    vertex3d = [];
    for (x=0; x < angles; x++){
      for (y=0; y < steps - 1; y++){

        x1 = x+1
        if (x1 == angles){
          x1 = 0;
        }
        y1 = y+1
        if (y1 == steps){
          y1 = 0;
        }
        a = vertexLines[x][y]
        b = vertexLines[x1][y]
        c = vertexLines[x][y1]
        d = vertexLines[x1][y1]

        //console.log('--')
        //console.log(x)
        //console.log(y)
        if (y>-1){
          vertex3d = quad(vertex3d, a, b, c, d)
        }

      }
    }

    //console.log("finallines:")
    //console.log(vertex3d);
    //console.log("finallines2:")
    //console.log(vertex3d);

}

function quad(array, a, b, c, d){
  //triangle 1
  array.push(a)
  array.push(b)
  array.push(b)
  array.push(c)
  array.push(c)
  array.push(a)
  //triangle 2
  array.push(a)
  array.push(d)
  array.push(d)
  array.push(c)
  array.push(c)
  array.push(a)
  return array;
}

function rotArray(axis, array, theta){
  newarray = []
  if (axis == "x" || axis == "X"){
    mat = rotateX(theta);
  }
  else if (axis == "y" || axis == "Y"){
    mat = rotateY(theta);
  }
  else if (axis == "z" || axis == "Z"){
    mat = rotateZ(theta);
  } else{
    console.log("INVALID AXIS");
    return
  }


  for (x = 0; x<array.length; x++){
    var point = vec4(array[x][0],array[x][1],array[x][2],1);
    var point2 = mult(mat, point);
    newarray.push(vec3(point2[0],point2[1],point2[2]))
  }
  return newarray;
}

function perspectiveArray(array){
  newarray = []
  mat = perspective(fovy, aspect, near, far);
  for (x = 0; x<array.length; x++){
    var point = vec4(array[x][0],array[x][1],array[x][2],1);
    var point2 = mult(mat, point);
    newarray.push(vec3(point2[0],point2[1],point2[2]))
  }
  return newarray;
}

// ########### The 3D Mode for Viewing the Surface of Revolution --- ADD CODE HERE ###########

function viewMethod() {
    // Ensure OpenGL viewport is resized to match canvas dimensions
    gl.viewportWidth = canvas.width;
    gl.viewportHeight = canvas.height;

    // Set screen clear color to R, G, B, alpha; where 0.0 is 0% and 1.0 is 100%
    gl.clearColor(0.9, 1.0, 0.9, 1.0);

    // Enable color; required for clearing the screen
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Clear out the viewport with solid black color
    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);

    // Use 3D program
    gl.useProgram(programId);

    //My code
    gl.uniform3fv(gl.getUniformLocation(programId, "lineColor"), vec3(0.5, 0.5, 0.5));

    var vPosition3 = gl.getAttribLocation(programId, "vPosition3");

    //apply rotation and zoom here
    array =  rotArray("X", vertex3d, altitude);
    array = rotArray("Y", array, azimuth);

    array = perspectiveArray(array);

    gl.bindBuffer(gl.ARRAY_BUFFER, cc3 );
    gl.bufferData(gl.ARRAY_BUFFER, flatten(array), gl.DYNAMIC_DRAW);

    gl.vertexAttribPointer(vPosition3, 3, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.LINES, 0, array.length);
}


// ########### The 2D Mode to draw the Bezier Curver --- ADD CODE HERE ###########

function drawMethod() {
    // Ensure OpenGL viewport is resized to match canvas dimensions
    gl.viewportWidth = canvas.width;
    gl.viewportHeight = canvas.height;

    // Set screen clear color to R, G, B, alpha; where 0.0 is 0% and 1.0 is 100%
    gl.clearColor(0.9, 1.0, 1.0, 1.0);

    // Enable color; required for clearing the screen
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Clear out the viewport with solid black color
    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);

    // Use 2D program
    gl.useProgram(program2dId);

    // Set line color for "axis of revolution"
    gl.uniform3fv(gl.getUniformLocation(program2dId, "lineColor"), vec3(0.5, 0.5, 0.5));

    // Draw the "axis of revolution"
    var vPosition = gl.getAttribLocation(program2dId, "vPosition");
    gl.bindBuffer(gl.ARRAY_BUFFER, axisBufferId);
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.LINES, 0, 20);

    //load and draw control points

    gl.bindBuffer(gl.ARRAY_BUFFER, cc );
    gl.bufferData(gl.ARRAY_BUFFER, flatten(controlPoints), gl.DYNAMIC_DRAW);
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);

    //change color and draw selected point
    if (selectedIndex != -1){
      gl.uniform3fv(gl.getUniformLocation(program2dId, "lineColor"), vec3(1, 0.5, 0.5));
      gl.drawArrays(gl.POINTS, selectedIndex, 1);
      gl.uniform3fv(gl.getUniformLocation(program2dId, "lineColor"), vec3(0.5, 0.5, 0.5));
    }


    gl.drawArrays(gl.POINTS, 0, 7);

    // Draw lines between control points

    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.LINE_STRIP, 0, 7);

    //Draw Bezier Curver
    bez = getBez();
    gl.uniform3fv(gl.getUniformLocation(program2dId, "lineColor"), vec3(0.5, 0.5, 1));

    gl.bufferData(gl.ARRAY_BUFFER, flatten(bez), gl.DYNAMIC_DRAW);
    //gl.drawArrays(gl.POINTS, 0, stepsPerCurve);
    gl.drawArrays(gl.LINE_STRIP, 0, stepsPerCurve);



    //console.log(getBez());
}

function getBez(){
  stepsPerCurve = stepsPerCurve / 2


  function bezier(u)
  {
    var b = [ ];
    var a = 1 - u;
    b.push(u*u*u);
    b.push(3*a*u*u);
    b.push(3*a*a*u);
    b.push(a*a*a);
    return b;
  }
  pointsArray = [];
  var d = 1.0/(stepsPerCurve - 1.0);
  for (var i = 0; i < stepsPerCurve; ++i) {
    var u = i*d;
    pointsArray[i] = [];
    pointsArray[i+stepsPerCurve] = [];
    for (var j = 0; j < 2; ++j) {
      d2 = [];
      d3 = [];
      d2[0] = controlPoints[0][j];
      d2[1] = controlPoints[1][j];
      d2[2] = controlPoints[2][j];
      d2[3] = controlPoints[3][j];

      d3[0] = controlPoints[3][j];
      d3[1] = controlPoints[4][j];
      d3[2] = controlPoints[5][j];
      d3[3] = controlPoints[6][j];
      pointsArray[i][j] = dot(bezier(u), d3);
      pointsArray[i+stepsPerCurve][j] = dot(bezier(u), d2);
    }
  }
  //console.log(pointsArray)

  stepsPerCurve = stepsPerCurve * 2
  return pointsArray
}



// Called automatically every 33 milliseconds to render the scene
function render() {
    if (mode == 1) {
        viewMethod();
    } else {
        drawMethod();
    }
}

// Initializations
window.onload = function() {


    // Get initial angles and steps
    numAngles = parseFloat(document.getElementById("numAngles").value);
    stepsPerCurve = parseFloat(document.getElementById("stepsPerCurve").value) + 2;
    if (stepsPerCurve % 2 != 0){
      stepsPerCurve ++;
    }

    // Find the canvas on the page
    canvas = document.getElementById("gl-canvas");

    // Initialize a WebGL context
    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) {
        alert("WebGL isn't available");
    }

    gl.enable(gl.DEPTH_TEST);

    // Load shaders
    programId = initShaders(gl, "vertex-shader", "fragment-shader");
    program2dId = initShaders(gl, "vertex-shader-2d", "fragment-shader");

    // Setup axis of revolution to be rendered in draw mode
    var revolutionAxis = [];
    for (var i = 0; i < 20; i++) {
        revolutionAxis[i] = vec2(0.0, 2 * i / 19.0 - 1);
    }


    axisBufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, axisBufferId );
    gl.bufferData(gl.ARRAY_BUFFER, flatten(revolutionAxis), gl.DYNAMIC_DRAW);


    cc = gl.createBuffer();
    //gl.bindBuffer(gl.ARRAY_BUFFER, cc );
    //gl.bufferData(gl.ARRAY_BUFFER, flatten(controlPoints), gl.DYNAMIC_DRAW);

    // Enable the position attribute for our 2D shader program.
    gl.useProgram(program2dId);
    var vPosition = gl.getAttribLocation(program2dId, "vPosition");
    gl.enableVertexAttribArray(vPosition);

    // Get the hardcoded control points
    var controlPoints = getControlPoints();

    // ###### Create vertex buffer objects --- ADD CODE HERE ######
    gl.useProgram(programId);
    var vPosition3 = gl.getAttribLocation(programId, "vPosition3");
    gl.enableVertexAttribArray(vPosition3);

    cc3 = gl.createBuffer();


    // Create the surface of revolution
    // (this should load the initial shape into one of the vertex buffer objects you just created)
    buildSurfaceOfRevolution(controlPoints, numAngles, stepsPerCurve);

    // Set up events for the HTML controls
    initControlEvents();

    // Setup mouse and keyboard input
    initWindowEvents();

    // Start continuous rendering
    window.setInterval(render, 33);
};
