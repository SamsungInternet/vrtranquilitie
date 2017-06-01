var workingDate = null;
var position = null;
var audioCtx = null;
var _APPID = 'ca0164a4646ab31e6f171460d83340d3';
var dataArray = null;
var scene = document.querySelector('a-scene');
var weather = null;


document.addEventListener('DOMContentLoaded', function() {
    setupSky();
    //set location
    if ('geolocation' in navigator){
        setWeatherInfo();
    }
    else{
        console.log('no position available - using default position // Paris');
    }
    //set audio
    //setAudioInfo();
    requestAnimationFrame(visualize);
});

var init =function(){
    setupSky();
};

var setupSky = function(){
    scene = document.querySelector('a-scene');
    var sky = document.createElement('a-sky');
    sky.setAttribute('src', '#sky');
    scene.appendChild(sky);
};

//sets the required environment for audio manipulation
function setAudioInfo(){
    //gets the audio context
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    //get microphone stream
    var mediaconstraints = {audio:true}; //defines media device constraints    
    navigator.mediaDevices.getUserMedia(mediaconstraints).then(function(mediaStream){        
        //create audio nodes
        source = audioCtx.createMediaStreamSource(mediaStream);
        analyser = audioCtx.createAnalyser();
        //configure nodes
        analyser.fftSize = 256;
        analyser.minDecibels = -90;
        analyser.maxDecibels = -10;
        analyser.smoothingTimeConstant = 0.85;
        var bufferLength = analyser.frequencyBinCount;
        //connect nodes
        source.connect(analyser);
        analyser.connect(audioCtx.destination);
        
    }).catch(function(err){console.log(err);});
}

//gets information on nearby weather status
function setWeatherInfo(){
    navigator.geolocation.getCurrentPosition(function(pos){
            dataReq = new XMLHttpRequest();
            dataReq.addEventListener('load', function(){
                let respData = JSON.parse(this.responseText);

                var sky = document.querySelector('a-sky');
                weather = respData;
                sky.setAttribute('color', 'hsl('+Math.floor(pos.coords.longitude+180)+', '+Math.floor(pos.coords.latitude+90)+'%, '+Math.ceil(110-weather.main.temp)+'%)');
            });
            var req = ' http://api.openweathermap.org/data/2.5/weather?lat='+pos.coords.latitude+'&lon='+pos.coords.longitude+'&units=metric&APPID='+_APPID;
            dataReq.open('GET', req);
            dataReq.send();
        });
}

function visualize(){

}

function shadeColor2(color, percent) {   
    var f=parseInt(color.slice(1),16),t=percent<0?0:255,p=percent<0?percent*-1:percent,R=f>>16,G=f>>8&0x00FF,B=f&0x0000FF;
    return "#"+(0x1000000+(Math.round((t-R)*p)+R)*0x10000+(Math.round((t-G)*p)+G)*0x100+(Math.round((t-B)*p)+B)).toString(16).slice(1);
}

function blendColors(c0, c1, p) {
    var f=parseInt(c0.slice(1),16),t=parseInt(c1.slice(1),16),R1=f>>16,G1=f>>8&0x00FF,B1=f&0x0000FF,R2=t>>16,G2=t>>8&0x00FF,B2=t&0x0000FF;
    return "#"+(0x1000000+(Math.round((R2-R1)*p)+R1)*0x10000+(Math.round((G2-G1)*p)+G1)*0x100+(Math.round((B2-B1)*p)+B1)).toString(16).slice(1);
}

function magnitudPiso(mag){ 
     var piso = document.getElementById('wall0');
     piso.pause();
     piso.setAttribute('ocean', 'amplitude', mag);
     piso.setAttribute('ocean', 'amplitudeVariance', mag);
     piso.play();
 }