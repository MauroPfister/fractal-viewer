var light_red = 1.0;
var light_green = 0.2;
var light_blue = 0.2;


function update_light_red(){
  light_red = $('#light_red_slid').val();
}

function update_light_green(){
    light_green = $('#light_green_slid').val();
}

function update_light_blue(){
    light_blue = $('#light_blue_slid').val();
}

function test(){
    alert("light_red: "+ light_red );
  }

// function review_render(){
//     alert("x rotation: "+ rot_x + "\nRadius: "+ radius);
//   }

// function update_rot_x(){
//   rot_x = $('#x_rot_slider').val();
// }


// function update_radius(){
//   radius = $('#radius_slider').val();
// }

