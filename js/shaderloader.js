
  // Shader Loader will load any shader you want,
  // And be able to add in large functions ( such as noise )
  
  function ShaderLoader( pathToShaders , pathToChunks ){

    this.shaders       = {};

    this.pathToShaders = pathToShaders || "/" ;
    this.pathToChunks  = pathToChunks || pathToShaders;

    this.shaderChunks  = {};

    this.shadersLoaded = 0;
    this.shadersToLoad = 0;

  }

  /*

    Loads in a shader chunk when told to by
    onShaderLoaded.

    The file name of the chunk has to be the same as
    the reference in the fragment shader where it should be inserted.

    For example: 
    The command $simplexNoise$ in a .vert or .frag file will be replaced
    with the content of the file simplexNoise.glsl

  */
  ShaderLoader.prototype.loadShaderChunk = function( chunkName ){

    var path = this.pathToChunks + "/" + chunkName + '.glsl';

    var self = this;
    $.ajax({
      url:path,
      dataType:'text',
      context:{
        name: chunkName,
        path: path
      },
      complete: function( r ){
        self.onChunkLoaded( r.responseText , this.name );
      },
      error:function( r ){
        console.log( 'ERROR: Unable to Load Shader' + this.path );
        self.onChunkLoaded( " NO SHADER LOADED " , this.name );
      }
    });

  }
  
  ShaderLoader.prototype.onChunkLoaded = function( chunkCode , chunkName ){

    this.shaderChunks[chunkName] = chunkCode;
    
  }
  
  /*
  
     This function loads shader called "shaderName"

  */
  ShaderLoader.prototype.load = function( shaderName ){
 
    var self = this;
    var type = shaderName.split(".")[1]

    this._beginLoad( shaderName , type);

    // request the file over AJAX
    $.ajax({
      url: self.pathToShaders +"/" + shaderName,
      dataType: 'text',
      complete: function(r){
        self.onShaderLoaded( r.responseText , type  );
      }
    });

  }

  /*
   
     Once a shader is loaded, check to see if there are any extra chunks 
     we need to find and pull in. 

     Will recall itself, until the chunk has been loaded in.

  */
  ShaderLoader.prototype.onShaderLoaded = function( shaderCode , type){

    var finalShader = shaderCode;
    
    var readyToLoad = true;


    var array = finalShader.split( "$" );

    for( var i = 1; i < array.length; i += 2 ){

      var chunkName = array[i].split("$\n")[0];

      if( this.shaderChunks[chunkName] ){

        var tmpShader = finalShader.split( "$" + chunkName + "$" );

        finalShader = tmpShader.join( this.shaderChunks[chunkName] );

      }else{

        readyToLoad = false;
        this.loadShaderChunk( chunkName );

      }

    }

    if( readyToLoad ){    
      
     if (type == 'vert') {
       this.shaders[type] = finalShader;
     } else if (type == 'frag') {
       this.shaders[type] = finalShader;
     }

      this._endLoad( finalShader , type );

    }else{

      var self = this;
      setTimeout( function(){
        self.onShaderLoaded( finalShader , type  )
      }, 300 );

    }

  }

  
  // might add something later...
  ShaderLoader.prototype._beginLoad = function( shaderName , type  ){
    this.shadersToLoad ++;
    this.beginLoad( shaderName , type  );
  }
  
  ShaderLoader.prototype._endLoad = function( shaderText, type ){
    this.shadersLoaded ++;

    if( this.shadersLoaded == this.shadersToLoad ){
      this.shaderSetLoaded();
    }
    
    this.endLoad( shaderText, type  );

  }
  


  ShaderLoader.prototype.setValue = function( shader , name , value ){

    //console.log( name , value );

    var a = '@'+name;
    //console.log( a );
   
    var replaced = false;

    var newStr = shader.replace( a , function(token){replaced = true; return value;}); 

    console.log( 'replaced' , replaced );
    return newStr;
  
  }

  ShaderLoader.prototype.shaderSetLoaded = function(){}
  ShaderLoader.prototype.endLoad = function(){}
  ShaderLoader.prototype.beginLoad = function(){}
