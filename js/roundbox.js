    
    "use strict";
        const gl = document.getElementById("c").getContext("webgl2");
    
        // some functions to turn view with mouse
        function getRelativeMousePosition(event, target) {
          target = target || event.target;
          var rect = gl.canvas.getBoundingClientRect();

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


        // load shaders
        var pathToShaders = '../shaders/';
        var pathToChunks  = '../shaders/';
        var shaderLoader = new ShaderLoader( pathToShaders , pathToChunks );

        var programInfo;
        var bufferInfo;

        shaderLoader.shaderSetLoaded = function() { 
            const stuff = setupShaders();
            programInfo = stuff.programInfo;
            bufferInfo = stuff.bufferInfo;
        }
          
        shaderLoader.load( 'default.vert' );
        shaderLoader.load( 'roundbox.frag' );
          
        var z_ang = 0.0;
        var y_ang = 0.0;
        var z_ang0 = 0.0;
        var y_ang0 = 0.0;
        var z_dif = 0;
        var y_dif = 0;
        var mouseDown = false;
        var pos0;

        window.addEventListener('mousedown', e=> {
          pos0 = getNoPaddingNoBorderCanvasRelativeMousePosition(e, gl.canvas);
          mouseDown = true;
        });

        window.addEventListener('mouseup', e=> {
          z_ang0 = z_ang;
          y_ang0 = y_ang;
          mouseDown = false;
        });

        window.addEventListener('mousemove', e => {

          if (mouseDown == true) {
            const pos = getNoPaddingNoBorderCanvasRelativeMousePosition(e, gl.canvas);
            // pos is in pixel coordinates for the canvas.
            // so convert to WebGL clip space coordinates
            //x = pos.x / gl.canvas.width  *  2 - 1;
            //y = pos.y / gl.canvas.height * -2 + 1;
            z_dif = (pos.x - pos0.x) / gl.canvas.width  *  2/2;
            y_dif = (pos.y - pos0.y) / gl.canvas.height * -2/2;            
            z_ang = ((y_ang % (2*Math.PI)) > (Math.PI/2) || (-y_ang % (2*Math.PI)) > (Math.PI/2))? z_ang0 - z_dif : z_ang0 + z_dif ;
            y_ang = y_ang0 + y_dif;    
            //console.log(y_ang);
            //console.log(((y_ang % (2*Math.PI)) > (Math.PI/2)))
          }



        });

        var z_axis = twgl.v3.create(0.0, 0, 1.0);
        var y_axis = twgl.v3.create(0, 1.0, 0);
    
        function setupShaders() {
          var vs = shaderLoader.shaders.vert;
          var fs = shaderLoader.shaders.frag;
          const programInfo = twgl.createProgramInfo(gl, [vs, fs]);
    
          const arrays = {
            position: [-1, -1, 0, 1, -1, 0, -1, 1, 0, -1, 1, 0, 1, -1, 0, 1, 1, 0],
          };
          const bufferInfo = twgl.createBufferInfoFromArrays(gl, arrays);

          requestAnimationFrame(render);

          return {
            programInfo,
            bufferInfo,
          }
        };
    
        function render() {
          twgl.resizeCanvasToDisplaySize(gl.canvas);
          gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
                    
          const uniforms = {
          };

          
          var m_view = twgl.m4.axisRotation(z_axis, z_ang);
          twgl.m4.axisRotate(m_view, y_axis, -y_ang, m_view);

          //z_axis = twgl.m4.transformDirection(twgl.m4.inverse(m_view), z_axis);
          //y_axis = twgl.m4.transformDirection(twgl.m4.inverse(m_view), y_axis);
          
          uniforms.m_view = m_view;
          uniforms.n = 8.0;
          uniforms.resolution = [gl.canvas.width, gl.canvas.height];

          gl.useProgram(programInfo.program);
          twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo);
          twgl.setUniforms(programInfo, uniforms);
          twgl.drawBufferInfo(gl, bufferInfo);
  
          requestAnimationFrame(render);
        }
        //requestAnimationFrame(render); 
        