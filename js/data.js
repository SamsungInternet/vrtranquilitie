var workingDate = null;
var position = null;
var audioCtx = null;
var _APPID = 'ca0164a4646ab31e6f171460d83340d3';
var dataArray = null;


document.addEventListener('DOMContentLoaded', function() {
    init();
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
                console.log(respData);
            });
            var req = ' http://api.openweathermap.org/data/2.5/weather?lat='+pos.coords.latitude+'&lon='+pos.coords.longitude+'&units=metric&APPID='+_APPID;
            dataReq.open('GET', req);
            dataReq.send();
        });
}

function visualize(){
    
    visualize();
}