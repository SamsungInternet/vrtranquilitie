var workingDate = null;
var pos = null;
var audioCtx = null;
var _APPID = 'ca0164a4646ab31e6f171460d83340d3';
var myDataArray = null;
var scene = document.querySelector('a-scene');
var weather = null;



var sample = null;

var usingMic = false; 
var ampLevel = null;
var loadedPlace = 'def';
var playPromise = null;

document.addEventListener('DOMContentLoaded', function() {
    //checks if it should load a default location
    var ext_res = getUrlParameter('loc');
    if(ext_res != ''){
        loadedPlace = ext_res;
    }
   
});

//sets up the environment for vr
var setupEnvironment = function(skytag, cantObjs){
    loadedPlace = skytag;
    getSmartCitizenInfo(skytag);
    setupSky(skytag);
    createSpiral(cantObjs);
    createSplash();
    sample = document.getElementsByTagName('a-sphere');
};

//gets the information form the openweathermap api for a location
var getWeatherInfo = function(){
    dataReq = new XMLHttpRequest();
    dataReq.addEventListener('load', function(){
        let respData = JSON.parse(this.responseText);
        var sky = document.querySelector('a-sky');
        weather = respData;
        environmentColor = 'hsl('+Math.floor(pos.coords.longitude+180)+', '+Math.floor(pos.coords.latitude+90)+'%, '+Math.ceil(110-weather.main.temp)+'%)';
    });
    var req = ' http://api.openweathermap.org/data/2.5/weather?lat='+pos.coords.latitude+'&lon='+pos.coords.longitude+'&units=metric&APPID='+_APPID;
    dataReq.open('GET', req);
    dataReq.send();
};

//lightens/darkens a shade of color
function shadeColor2(color, percent) {   
    var f=parseInt(color.slice(1),16),t=percent<0?0:255,p=percent<0?percent*-1:percent,R=f>>16,G=f>>8&0x00FF,B=f&0x0000FF;
    return "#"+(0x1000000+(Math.round((t-R)*p)+R)*0x10000+(Math.round((t-G)*p)+G)*0x100+(Math.round((t-B)*p)+B)).toString(16).slice(1);
}

//blends two colors
function blendColors(c0, c1, p) {
    var f=parseInt(c0.slice(1),16),t=parseInt(c1.slice(1),16),R1=f>>16,G1=f>>8&0x00FF,B1=f&0x0000FF,R2=t>>16,G2=t>>8&0x00FF,B2=t&0x0000FF;
    return "#"+(0x1000000+(Math.round((R2-R1)*p)+R1)*0x10000+(Math.round((G2-G1)*p)+G1)*0x100+(Math.round((B2-B1)*p)+B1)).toString(16).slice(1);
}

//creates a ring of spheres
var createShapes = function(num, r){
    var angle = (360/num)+1;
    console.log(angle);
    var scene = document.querySelector('a-scene');
    for(i = 0; i < num; i++){
        var x = r*Math.cos(angle*i);
        var y = 1.5;
        var z = r*Math.sin(angle*i);
        var s = document.createElement('a-sphere');
        s.setAttribute('radius', '.5');
        s.setAttribute('position', x +' ' + y + ' ' + z);
        scene.appendChild(s);
    }
};

//gets a query string parameter
function getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    var results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
};