var workingDate = null;
var position = null;
var _APPID = 'ca0164a4646ab31e6f171460d83340d3';
var analyser = null;


document.addEventListener('DOMContentLoaded', function() {
    init();
    //get date
    workingDate = new Date();
    //get location
    if ('geolocation' in navigator){
        navigator.geolocation.getCurrentPosition(function(pos){
            position = pos;
            getDevicesNear(pos.coords.latitude, pos.coords.longitude);
        });
    }
    else{
        console.log('using default position // Paris');
    }
    //set audio context
    var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    //get microphone stream
    var mediaconstraints = {audio:true};
    
    navigator.mediaDevices.getUserMedia(mediaconstraints).then(function(mediaStream){
        source = audioCtx.createMediaStreamSource(mediaStream);
        biquad = audioCtx.createBiquadFilter();
        analyser = audioCtx.createAnalyser();
        gain = audioCtx.createGain();

        //configure nodes
        biquad.type = "lowshelf";
        biquad.frequency.value = 1000;
        biquad.gain.value = 30;
        gain.gain.value = .3;
        
        //connect nodes
        source.connect(biquad);
        biquad.connect(gain);
        gain.connect(audioCtx.destination);

        //sets up the request animation frame 
        window.requestAnimationFrame(reqAniFra);

    }).catch(function(err){console.log(err);});
});

function reqAniFra(){
    //console.log(analyser);
    reqAniFra();
}

function reqListener() {    
    let respData = JSON.parse(this.responseText);
    console.log(respData);
}

function getDevicesNear(lat, lon){
    dataReq = new XMLHttpRequest();
    dataReq.addEventListener('load', reqListener);
    var req = ' http://api.openweathermap.org/data/2.5/weather?lat='+position.coords.latitude+'&lon='+position.coords.longitude+'&units=metric&APPID='+_APPID;
    dataReq.open('GET', req);
    dataReq.send();
}

function magnitudPiso(mag){
    var piso = document.getElementById('wall0');
    piso.pause();
    piso.setAttribute('ocean', 'amplitude', mag);
    piso.setAttribute('ocean', 'amplitudeVariance', mag);
    piso.play();
}

function init(){
    magnitudPiso(0);
}
