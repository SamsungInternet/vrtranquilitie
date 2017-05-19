var workingDate = null;
var position = null;
var _APPID = 'ca0164a4646ab31e6f171460d83340d3';


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
    //get microphone stream
    var mediaconstraints = {audio:true};
    navigator.mediaDevices.getUserMedia(mediaconstraints).then(function(mediaStream){
         var micAudioTag = document.getElementById('micStream');
         micAudioTag.src = window.URL.createObjectURL(mediaStream);
         micAudioTag.play();
    }).catch(function(err){console.log(err.name + ": " + err.message);});

});

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

function init(){

}