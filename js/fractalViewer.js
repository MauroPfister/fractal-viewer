"use strict";

const gl = document.getElementById("c").getContext("webgl2");

// load shaders
var pathToShaders = 'shaders/';
var pathToChunks  = 'shaders/';
var shaderLoader = new ShaderLoader( pathToShaders , pathToChunks );

// global variables for shader and buffer info
var programInfo;
var bufferInfo;

// uniforms
// var max_iter = 200;
var power = 8.0;
var eps_multiplicator = 2.0;
var scale = 1.0;
var light1_color = twgl.v3.create(1.0, 1.0, 1.0);
var light2_color = twgl.v3.create(1.0, 1.0, 1.0);
var julia_im = twgl.v3.create(0.88,0.24, 0.1); 
var julia_real = 0.18;


// global variables for turning viewport with mouse
var z_dif = 0;
var y_dif = 0;
var mouseDown = false;
var pos0;
var z_axis = twgl.v3.create(0.0, 0, 1.0);
var y_axis = twgl.v3.create(0, 1.0, 0);
var m_rot = twgl.m4.identity();
var m_view = twgl.m4.identity();


// change dropdown button label
$('.dropdown-menu a').on('click', function() {    
  $('.dropdown-toggle').html($(this).html());   
  var fractalType = $(this).html(); 
  selectFractal(fractalType);
})

// change power of fractal
$('#power_slid').on('input', function() {
    power = $(this).val();
    requestAnimationFrame(render);
})

// change max iterations
// $('#max_iter_slid').on('input', function() {
//     max_iter = $(this).val();
//     requestAnimationFrame(render);
// })

// change epsilon
$('#eps_slid').on('input', function() {
    eps_multiplicator = $(this).val();
    requestAnimationFrame(render);
})

// change light colors
$('#light1-color').colorpicker({
    useAlpha: false,
    color: "#FFFFFF"
});

$('#light2-color').colorpicker({
    useAlpha: false,
    color: "#FFFFFF"
});

$('#light1-color').on('colorpickerChange', function(event) {
    var rgbString = event.color.toRgbString();
    var rgbArray = rgbString.split(')')[0].split('(')[1].split(', ');   // very ugly hack to get RGB components in an vector
    light1_color = rgbArray;
    twgl.v3.divScalar(light1_color, 255.0, light1_color);
    requestAnimationFrame(render);
});

$('#light2-color').on('colorpickerChange', function(event) {
    var rgbString = event.color.toRgbString();
    var rgbArray = rgbString.split(')')[0].split('(')[1].split(', ');   // very ugly hack to get RGB components in an vector
    light2_color = rgbArray;
    twgl.v3.divScalar(light2_color, 255.0, light2_color);
    requestAnimationFrame(render);
});

// change imaginary part of c constant of julia set
$('#Julia-im').colorpicker({
  useAlpha: true,
  color: "#FE3D19"
});

$('#Julia-im').on('colorpickerChange', function(event) {
  var rgbString = event.color.toRgbString();
  var rgbArray = rgbString.split(')')[0].split('(')[1].split(', ');   // very ugly hack to get RGB components in an vector
  julia_im = rgbArray;
  twgl.v3.divScalar(julia_im, 255.0, julia_im);
  requestAnimationFrame(render);
});

// change real part of c constant of julia set
$('#Julia-real').on('input', function() {
  julia_real = $(this).val();
  requestAnimationFrame(render);
})
    
// reset values
$('#reset_button').on('click', function() {
    scale = 1.0;
    m_rot = twgl.m4.identity();

    eps_multiplicator = 2.0;
    power = 8.0;
    requestAnimationFrame(render);
})

// mouse event listeners
gl.canvas.addEventListener('mousedown', e => {
  pos0 = getRelativeMousePosition(e, gl.canvas);
  mouseDown = true;
});

window.addEventListener('mouseup', e => {
  mouseDown = false;

  twgl.m4.axisRotate(m_rot, z_axis, z_dif, m_rot);
  twgl.m4.axisRotate(m_rot, y_axis, -y_dif, m_rot)

  z_dif = 0;
  y_dif = 0;
});

// redraw fractal when window is resized
window.addEventListener('resize', e => {
  requestAnimationFrame(render);
});

// turn fractal when mouse clicked and dragged
window.addEventListener('mousemove', e => {

  if (mouseDown == true) {
    const pos = getRelativeMousePosition(e, gl.canvas);
    z_dif = (pos.x - pos0.x) / gl.canvas.width * 2;
    y_dif = -(pos.y - pos0.y) / gl.canvas.height * 2;             
    requestAnimationFrame(render);
  }
});

function getRelativeMousePosition(event, target) {
  var rect = gl.canvas.getBoundingClientRect();
  
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
  }
}

// zoom into fractal
gl.canvas.addEventListener('wheel', e => {
    var newScale = scale * (1 + 0.01*event.deltaY);
    // restrict zoom 
    if (newScale < 10 && newScale > 0.01) {
        scale = newScale;
        requestAnimationFrame(render);
    }
});


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
    case "Juliaset":
      shaderLoader.load( 'julia.frag' );
      break;    
    case "Sierpinski pyramid":
      shaderLoader.load( 'pyramid.frag' );
      break;
    default:
      shaderLoader.load( 'default.frag' );
  }
}
  
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
  
  m_view = twgl.m4.copy(m_rot);
  twgl.m4.axisRotate(m_view, z_axis, z_dif, m_view);
  twgl.m4.axisRotate(m_view, y_axis, -y_dif, m_view);
  
  twgl.m4.scale(m_view, twgl.v3.create(scale, scale, scale, 1.0), m_view)

  const uniforms = {
    m_view : m_view,
    n : power,
    resolution : [gl.canvas.width, gl.canvas.height],
    light1_color : light1_color,
    light2_color : light2_color,
    eps_multiplicator : eps_multiplicator,
    max_iter : 200,
    julia_real : julia_real,
    julia_im : julia_im,
  };
  
  gl.useProgram(programInfo.program);
  twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo);
  twgl.setUniforms(programInfo, uniforms);
  twgl.drawBufferInfo(gl, bufferInfo);
}
