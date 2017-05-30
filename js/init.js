var glObj={}

function _GET(name)
{
    var indexForGetParameters=window.location.search.indexOf("?");
    var url;
    if(indexForGetParameters!=-1){
        url = window.location.search.substring(indexForGetParameters+1);
    }
    else{
        indexForGetParameters=window.location.hash.indexOf("?");
        url = window.location.hash.substring(indexForGetParameters+1);
    }
    var itens = url.split("&");
 
    for(n in itens)
    {
        if( itens[n].match(name) )
        {
            return decodeURIComponent(itens[n].replace(name+"=", ""));
        }
    }
    return null;
}

function createTextureFromBinaryVector(binaryVector){
    var ret=[]
    for(var i=0;i<binaryVector.length;i++){
        if(binaryVector[i]==1){
            ret.push(0xff);
            ret.push(0xff);
            ret.push(0xff);
            ret.push(0xff);
        }
        else{
            ret.push(0x0)
            ret.push(0x0)
            ret.push(0x0)
            ret.push(0xff)
        }
    }
    return new Uint8Array(ret)
}
function render(idCanvas,minX,minY,maxX,maxY,fractalString) {    
    // Get A WebGL context
    var getElementInsideContainer= function (containerID, childID) {
        var elm = document.getElementById(containerID);
        
        var child = null;
        var search= function(parent,childID){
            var returnChild=null;
            for(var i=0;i<parent.childNodes.length;i++){
                if(parent.childNodes[i].id==childID){
                    returnChild=parent.childNodes[i];                
                    break;
                }
                returnChild=search(parent.childNodes[i],childID);
                if(returnChild!=null) break;
            }
            
            return returnChild;
        }
        return search(elm,childID);
    }
    var canvas = getElementInsideContainer(idCanvas,"myCanvas");
    var gl=null;
    if(glObj[idCanvas]===undefined){
        gl = getWebGLContext(canvas);
        if (!gl) {
            return;
        }
    // setup GLSL program
        vertexShader = createShaderFromScriptElement(gl, "2d-vertex-shader");
        fragmentShader = createShaderFromScriptElement(gl, "2d-fragment-shader");
        program = createProgram(gl, [vertexShader, fragmentShader]);
        gl.useProgram(program);
    }
    else{
        gl=glObj[idCanvas].gl;
    }
    // look up where the vertex data needs to go.
    var positionLocation;
   
    positionLocation = gl.getAttribLocation(program, "a_position");
   

    
    
    
    var a_point = gl.getAttribLocation(program, "a_point");
    var a_pointBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, a_pointBuffer);
    

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        minX, minY,
        maxX, minY,
        minX, maxY,
        minX, maxY,
        maxX, minY,
        maxX, maxY]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(a_point);
    gl.vertexAttribPointer(a_point, 2, gl.FLOAT, false, 0, 0);
     
    var u_sizeOfString= gl.getUniformLocation(program, "u_sizeOfString");

    //var string=[0,1];
    gl.uniform1i(u_sizeOfString, fractalString.length);

           
    var texture=gl.createTexture();         
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA,fractalString.length ,1,0, gl.RGBA, gl.UNSIGNED_BYTE,createTextureFromBinaryVector(fractalString));
    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.uniform1i(gl.getUniformLocation(program, "u_string"), 0);
    
    // lookup uniforms
    var resolutionLocation = gl.getUniformLocation(program, "u_resolution");
        
    // set the resolution
    gl.uniform2f(resolutionLocation, canvas.width, canvas.height);        
    
    // Create a buffer for the position of the rectangle corners.
    var buffer=null;

    buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);    
    
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
        

    setRectangle(gl, 0, 0, canvas.width, canvas.height);
        
    // Draw the rectangle.
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    if(glObj[idCanvas]===undefined){
        glObj[idCanvas]={
            gl:gl,
        };
    }
}

function randomInt(range) {
  return Math.floor(Math.random() * range);
}

function setRectangle(gl, x, y, width, height) {
  var x1 = x;
  var x2 = x + width;
  var y1 = y;
  var y2 = y + height;
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
     x1, y1,
     x2, y1,
     x1, y2,
     x1, y2,
     x2, y1,
     x2, y2]), gl.STATIC_DRAW);
}
window.onload= function (){
    //?minX=3.8515429214601236&maxX=3.852637166191114&minY=3.376557367777127&maxY=3.3776516125081173&fractalString=11110000101000011001011110111111011100011000000110011010100111110111000010010110100010101001111101110000101000101000110000000101
    //url parameters================================================
    var fractalStringStr=""
    
    //end===========================================================
    
    //parameters for fractal========================================
    var minX=2.9;
    var minY=2.9;
    var maxX=4;
    var maxY=4;
    var fractalString=[0,1,1,1,0,0,0,0,
                       1,0,1,0,0,0,0,1,
                       1,0,0,1,1,0,1,1,
                       1,0,1,1,1,1,1,1,
                       0,1,1,1,0,0,0,1,
                       1,0,0,0,0,0,0,1,
                       1,0,0,1,1,0,1,0,
                       1,0,0,1,1,1,1,1,
                       0,1,1,1,0,0,0,0,
                       1,0,0,1,0,1,1,0,
                       1,0,0,0,1,0,1,0,
                       1,0,0,1,1,1,1,1,
                       0,1,1,1,0,0,0,0,
                       1,0,1,0,0,0,1,0,
                       1,0,0,0,1,0,1,0,
                       1,0,0,1,1,1,0,0];
    
    var scale=(maxY-minY)/2;    
    //end===========================================================
    
    //adjust fractal parameters from page url=======================
    if(_GET("fractalString")!=null){
        fractalString=[];
        fractalStringStr=_GET("fractalString");
        for(var i=0;i<fractalStringStr.length;i++){
            fractalString.push(parseInt(fractalStringStr[i]));
        }
    }
    else{
        for(var i=0;i<fractalString.length;i++)
            fractalStringStr=fractalStringStr+fractalString[i];
    }
    if(_GET("minX")!=null)
        minX=parseFloat(_GET("minX"));
    if(_GET("minY")!=null)
        minY=parseFloat(_GET("minY"));
    if(_GET("maxX")!=null)
        maxX=parseFloat(_GET("maxX"));
    if(_GET("maxY")!=null)
        maxY=parseFloat(_GET("maxY"));
    scale=(maxY-minY)/2;
    //end===========================================================
    
    //create elements in html interface=============================
    for(var i=0;i<128;i++){        
        $("#inputString").html($("#inputString").html()+' <input id="stringElement'+i+'" data-toggle="tooltip"  title="element '+i+' of string"  min="0" max="1" style="max-width:60px; display:inline-block; margin-right:10px; margin-top:5px;" class="form-control string-display" placeholder="" aria-describedby="sizing-addon2" type="number">');
    
    }
    for(var i=0;i<128;i++)
        $("#stringElement"+i).val(fractalString[i]);

    $("#positionX").val(minX+((maxX-minX)/2));
    $("#positionY").val(minY+((maxY-minY)/2));
    $("#scale").val(Math.abs((maxY-minY)/2));
    $('[data-toggle="tooltip"]').tooltip();
    
    $('body').scrollspy({
        target: '.navbar-fixed-top',
        offset: 51
    });
    $("#url").val("?minX="+minX+"&maxX="+maxX+"&minY="+minY+"&maxY="+maxY+"&fractalString="+fractalStringStr);
    //end===========================================================
    
    

    
    //triggers to give control of the fractal to the html elements==
    $(".string-display").change(function(e){
        var ignoreInputs=false
        fractalString=[];
        fractalStringStr="";
        for(var i=0;i<128;i++){
            if(ignoreInputs==false){
                if($("#stringElement"+i).val()!='0' && $("#stringElement"+i).val()!='1' && $("#stringElement"+i).val()!=''){
                    $("#stringElement"+i).addClass("inputError");
                }
                else{
                    $("#stringElement"+i).removeClass("inputError");
                    if($("#stringElement"+i).val()==''){
                        $("#stringElement"+i).addClass("inputIgnore");
                        ignoreInputs=true;
                    }
                    else{                     
                        $("#stringElement"+i).removeClass("inputIgnore")
                        fractalString.push(parseInt($("#stringElement"+i).val()));
                    }
                }
            }
            else{
                $("#stringElement"+i).addClass("inputIgnore");
            }
        }
        for(var i=0;i<fractalString.length;i++)
            fractalStringStr=fractalStringStr+fractalString[i];

        $("#url").val("?minX="+minX+"&maxX="+maxX+"&minY="+minY+"&maxY="+maxY+"&fractalString="+fractalStringStr);
        render("fractal",minX,minY,maxX,maxY,fractalString);
    });
    
    $("#zoom-out").click(function (){
        scale=scale*1.10;
        var posix=minX+((maxX-minX)/2);
        var posiy=minY+((maxY-minY)/2);
        var range=((maxX-minX)/2);
        minX=posix-(range*1.1);
        minY=posiy-(range*1.1);
        maxX=posix+(range*1.1);
        maxY=posiy+(range*1.1);
        render("fractal",minX,minY,maxX,maxY,fractalString);
        $("#scale").val(scale);
        $("#url").val("?minX="+minX+"&maxX="+maxX+"&minY="+minY+"&maxY="+maxY+"&fractalString="+fractalStringStr);
    });
    $("#zoom-in").click(function (){
        scale=scale*0.9;
        var posix=minX+((maxX-minX)/2);
        var posiy=minY+((maxY-minY)/2);
        var range=((maxX-minX)/2);
        minX=posix-(range*0.9);
        minY=posiy-(range*0.9);
        maxX=posix+(range*0.9);
        maxY=posiy+(range*0.9);
        render("fractal",minX,minY,maxX,maxY,fractalString);
        $("#scale").val((maxX-minX)/2);
        $("#url").val("?minX="+minX+"&maxX="+maxX+"&minY="+minY+"&maxY="+maxY+"&fractalString="+fractalStringStr);
    });
    //end===========================================================
    
    //implements touch and drag in canvas with fractal==============
    var mouseDragDrop=false;
    var positionWhenMouseDownWasCalled=[-1,-1];
    var xt=-1;
    var yt=-1;


    $( "#fractal" ).mousemove(function( event ) {
        if(mouseDragDrop){
            var x= (event.pageX-positionWhenMouseDownWasCalled[0]);
            var y= (event.pageY-positionWhenMouseDownWasCalled[1]);
            var mx;
            var my;
            if(xt!=-1){
                mx=((x-xt)/1000.0)*(scale/0.05);
            }
                 
            if(yt!=-1){
                my=((y-yt)/1000.0)*(scale/0.05);
            }
           

            if(xt!=-1 && yt!=-1){
                minX=minX-mx;
                minY=minY-my;
                maxY=maxY-my;
                maxX=maxX-mx;
                render("fractal",minX,minY,maxX,maxY,fractalString);
                $("#positionX").val(minX+((maxX-minX)/2));
                $("#positionY").val(minY+((maxY-minY)/2));
            }
            xt=x;
            yt=y;
            $("#url").val("?minX="+minX+"&maxX="+maxX+"&minY="+minY+"&maxY="+maxY+"&fractalString="+fractalStringStr);
        }
    });
    $("#fractal").mouseup(function() {
        mouseDragDrop=false;
        xt=-1;
        yt=-1;
    });
    $("#fractal").mouseup(function() {
        mouseDragDrop=false;
        xt=-1;
        yt=-1;
    });
    $("#fractal").mousedown(function(event) {
        mouseDragDrop=true;
        positionWhenMouseDownWasCalled[0]=event.pageX;
        positionWhenMouseDownWasCalled[1]=event.pageY;
    });    
    //end===========================================================

    render("fractal",minX,minY,maxX,maxY,fractalString); //render the fractal when page is open
};
