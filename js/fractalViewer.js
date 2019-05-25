"use strict";

// change dropdown button label
$('.dropdown-menu a').on('click', function() {    
  $('.dropdown-toggle').html($(this).html());   
  var fractalType = $(this).html(); 
  selectFractal(fractalType);
})

//document.getElementById('runSelector').onclick = function() {selectFractal(fractalType)};

const gl = document.getElementById("c").getContext("webgl2");
function getRelativeMousePosition(event, target) {
  var rect = gl.canvas.getBoundingClientRect();
  
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
  }
}

// load shaders
var pathToShaders = 'shaders/';
var pathToChunks  = 'shaders/';
var shaderLoader = new ShaderLoader( pathToShaders , pathToChunks );

// global variables for shader and buffer info
var programInfo;
var bufferInfo;

shaderLoader.shaderSetLoaded = function() { setupShaders(); }

function selectFractal(fractalType) {
  shaderLoader.load( 'passing_through.vert' );
  switch(fractalType) {
    case "Rounded box":
      shaderLoader.load( 'roundbox.frag' );
      break;
    case "Mandelbulb":
      shaderLoader.load( 'mandelbulb.frag' );
      break;
    case "Mandelbox":
      shaderLoader.load( 'mandelbox.frag' );
      break;
    case "Sierpinski pyramid":
      shaderLoader.load( 'pyramid.frag' );
      break;
    default:
      shaderLoader.load( 'default.frag' );
  }
}
  
var z_ang = 0.0;
var y_ang = 0.0;
var z_ang0 = 0.0;
var y_ang0 = 0.0;
var z_dif = 0;
var y_dif = 0;
var mouseDown = false;
var pos0;

var z_axis = twgl.v3.create(0.0, 0, 1.0);
var y_axis = twgl.v3.create(0, 1.0, 0);

var m_rot = twgl.m4.identity();

gl.canvas.addEventListener('mousedown', e=> {
  pos0 = getRelativeMousePosition(e, gl.canvas);
  mouseDown = true;
});

window.addEventListener('mouseup', e=> {
  z_ang0 = z_ang;
  y_ang0 = y_ang;
  mouseDown = false;
});

window.addEventListener('mousemove', e => {

  if (mouseDown == true) {
    const pos = getRelativeMousePosition(e, gl.canvas);

    // pos is in pixel coordinates for the canvas.
    // so convert to WebGL clip space coordinates
    //x = pos.x / gl.canvas.width  *  2 - 1;
    //y = pos.y / gl.canvas.height * -2 + 1;
    z_dif = (pos.x - pos0.x) / gl.canvas.width  *  2/2;
    y_dif = (pos.y - pos0.y) / gl.canvas.height * -2/2;            
    //z_ang = ((y_ang % (2*Math.PI)) > (Math.PI/2) || (-y_ang % (2*Math.PI)) > (Math.PI/2))? z_ang0 - z_dif : z_ang0 + z_dif ;
    //y_ang = y_ang0 + y_dif;    
    
    twgl.m4.axisRotate(m_rot, z_axis, z_dif, m_rot);
    twgl.m4.axisRotate(m_rot, y_axis, -y_dif, m_rot);

    pos0 = pos;
  }
});


// setup shader and buffer information
function setupShaders() {
  var vs = shaderLoader.shaders.vert;
  var fs = shaderLoader.shaders.frag;
  programInfo = twgl.createProgramInfo(gl, [vs, fs]);

  const arrays = {
    position: [-1, -1, 0, 1, -1, 0, -1, 1, 0, -1, 1, 0, 1, -1, 0, 1, 1, 0],
  };

  bufferInfo = twgl.createBufferInfoFromArrays(gl, arrays);

  requestAnimationFrame(render);
};

// actually put the fractal on screen
function render() {
  twgl.resizeCanvasToDisplaySize(gl.canvas);
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
            
  const uniforms = {};
  
  uniforms.m_view = m_rot;
  uniforms.n = 8.0;
  uniforms.resolution = [gl.canvas.width, gl.canvas.height];

  gl.useProgram(programInfo.program);
  twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo);
  twgl.setUniforms(programInfo, uniforms);
  twgl.drawBufferInfo(gl, bufferInfo);

  requestAnimationFrame(render);
}
