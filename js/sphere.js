

"use strict";
const gl = document.querySelector("#c").getContext("webgl2");



  function getRelativeMousePosition(event, target) {
    target = target || event.target;
    var rect = target.getBoundingClientRect();

    return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
  }
  }

  // assumes target or event.target is canvas
  function getNoPaddingNoBorderCanvasRelativeMousePosition(event, target) {
  target = target || event.target;
  var pos = getRelativeMousePosition(event, target);

  pos.x = pos.x * target.width  / target.clientWidth;
  pos.y = pos.y * target.height / target.clientHeight;

  return pos;  
  }


var pathToShaders = '../shaders/';
var pathToChunks  = '../shaders/';
var shaderLoader = new ShaderLoader( pathToShaders , pathToChunks );



window.addEventListener('mousemove', e => {

const pos = getNoPaddingNoBorderCanvasRelativeMousePosition(e, gl.canvas);

// pos is in pixel coordinates for the canvas.
// so convert to WebGL clip space coordinates
const x = pos.x / gl.canvas.width  *  2 - 1;
const y = pos.y / gl.canvas.height * -2 + 1;

shaderLoader.shaderSetLoaded = function() { 
    draw();
  }

shaderLoader.load( 'default.vert' );
shaderLoader.load( 'sphere.frag' );
//shaderLoader.load( 'TWGL_test1.vert' );
//shaderLoader.load( 'TWGL_test1.frag' );

});



function draw() {
  var vs = shaderLoader.shaders.vert;
  var fs = shaderLoader.shaders.frag;
  const programInfo = twgl.createProgramInfo(gl, [vs, fs]);

  const arrays = {
    position: [-1, -1, 0, 1, -1, 0, -1, 1, 0, -1, 1, 0, 1, -1, 0, 1, 1, 0],
    //position: { numComponents : 2, data : [-1, -1, 1, -1, -1, 1, 1, 1], },
  };
  const bufferInfo = twgl.createBufferInfoFromArrays(gl, arrays);

  function render(time) {
    twgl.resizeCanvasToDisplaySize(gl.canvas);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    
    /*
    const uniforms = {
      time: time * 0.001,
      resolution: [gl.canvas.width, gl.canvas.height],
    };*/
    
    const uniforms = {
      m_view: twgl.m4.rotateX(twgl.m4.identity(), rot_x, 0),
      resolution: [gl.canvas.width, gl.canvas.height],
      r: radius,
    };
    
    gl.useProgram(programInfo.program);
    twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo);
    twgl.setUniforms(programInfo, uniforms);
    twgl.drawBufferInfo(gl, bufferInfo);

    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
};

