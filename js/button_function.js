
var scale = 1.0;

function reset_all(){
  scale = 1.0;
  m_rot = twgl.m4.identity();
  
  eps_multiplicator = 2.0;
  max_iter = 200;
  power = 8.0;
  requestAnimationFrame(render);
  }

