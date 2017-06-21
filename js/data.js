var workingDate = null;
var pos = null;
var audioCtx = null;
var _APPID = 'ca0164a4646ab31e6f171460d83340d3';
var myDataArray = null;
var scene = document.querySelector('a-scene');
var weather = null;
var smartCitizenData = null;
var environmentColor = '#FFFFFF';
var analyser = null;
var audioCtx = new (window.AudioContext || window.webkitAudioContext)();

document.addEventListener('DOMContentLoaded', function() {
    //set location
    if ('geolocation' in navigator){
        navigator.geolocation.getCurrentPosition(function(ppos){
            pos = ppos;
            setupEnvironment();
        }, function(error){pos = {'coords':{'latitude':48.8566, 'longitude':2.3522}};});
    }
    else{
       pos = {'coords':{'latitude':48.8566, 'longitude':2.3522}};
       setupEnvironment();
    }
});

var setupEnvironment = function(){
    getWeatherInfo();
    getSmartCitizenInfo();
    setAudio(false);
    setupSky();
    createSpiral(128);

    window.requestAnimationFrame(visualize);
};

var visualize = function(){
    sampleFrequency();
    var sample = document.getElementsByTagName('a-sphere');
    for(i = 0 ; i < 128; i++){
        sample[i].setAttribute('radius', myDataArray[128]/100);
    }
    window.requestAnimationFrame(visualize);
};


var setupSky = function(){
    scene = document.querySelector('a-scene');
    var sky = document.createElement('a-sky');
    sky.setAttribute('src', '#sky');
    scene.appendChild(sky);
};

//sets the required environment for audio manipulation
var setAudio = function(useMic){
    //create audio nodes
    source = null;
    if(useMic){
        //get microphone stream 
        var mediaconstraints = {audio:true}; //defines media device constraints    
        navigator.mediaDevices.getUserMedia(mediaconstraints).then(function(mediaStream){
        //create audio nodes
        source = audioCtx.createMediaStreamSource(mediaStream);
        analyser = audioCtx.createAnalyser();
        analyser.fftSize = 1024;
        myDataArray = new Float32Array(analyser.frequencyBinCount);
        analyser.getFloatFrequencyData(myDataArray); 
        //connect nodes
        source.connect(analyser);
        analyser.connect(audioCtx.destination);
        }).catch(function(err){console.log(err);}); 

    }
    else{
        ambientSoundTag = document.querySelector('#street'); 
        ambientSoundTag.play();
        source = audioCtx.createMediaElementSource(ambientSoundTag);
        analyser = audioCtx.createAnalyser();
        analyser.fftSize = 1024;
        myDataArray = new Float32Array(analyser.frequencyBinCount);
        analyser.getFloatFrequencyData(myDataArray); 
        //connect nodes
        source.connect(analyser);
        analyser.connect(audioCtx.destination);
    }    
};

var sampleFrequency = function(){
    myDataArray = new Float32Array(analyser.frequencyBinCount);
    analyser.getFloatFrequencyData(myDataArray);
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

//gets the information form smartcitizen kits near a location
var getSmartCitizenInfo = function(){
    dataReq = new XMLHttpRequest();
        dataReq.addEventListener('load', function(){
            let respData = JSON.parse(this.responseText);
            smartCitizenData = respData;
        });
        var req= 'https://api.smartcitizen.me/v0/devices/?near='+pos.coords.latitude+','+pos.coords.longitude;
        dataReq.open('GET', req);
        dataReq.send();
};


function shadeColor2(color, percent) {   
    var f=parseInt(color.slice(1),16),t=percent<0?0:255,p=percent<0?percent*-1:percent,R=f>>16,G=f>>8&0x00FF,B=f&0x0000FF;
    return "#"+(0x1000000+(Math.round((t-R)*p)+R)*0x10000+(Math.round((t-G)*p)+G)*0x100+(Math.round((t-B)*p)+B)).toString(16).slice(1);
}

function blendColors(c0, c1, p) {
    var f=parseInt(c0.slice(1),16),t=parseInt(c1.slice(1),16),R1=f>>16,G1=f>>8&0x00FF,B1=f&0x0000FF,R2=t>>16,G2=t>>8&0x00FF,B2=t&0x0000FF;
    return "#"+(0x1000000+(Math.round((R2-R1)*p)+R1)*0x10000+(Math.round((G2-G1)*p)+G1)*0x100+(Math.round((B2-B1)*p)+B1)).toString(16).slice(1);
}

//gets the decibels in the single nearest smartcitizen kit or in the area
var getLocalDecibels = function(single){
    var db = 0;
    var cant = 0;
    var hasfoundDecibel = false;
    for (i = 0; i < smartCitizenData.length; i++){
        if(!hasfoundDecibel || !single){
            if(smartCitizenData[i].state == 'has_published'){
                for(j = 0; j < smartCitizenData[i].data.sensors.length; j++){
                    if(smartCitizenData[i].data.sensors[j].unit == 'dB'){
                        db += smartCitizenData[i].data.sensors[j].value;
                        cant++;
                        hasfoundDecibel = true;
                        break;
                    }else{continue;}
                }
            }else{continue;}
        }else{break;}
    }
    console.log(cant);
    return db/cant;
};

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
        s.setAttribute('color', environmentColor);
        s.setAttribute('position', x +' ' + y + ' ' + z);
        scene.appendChild(s);
    }
};

var createSpiral = function(num){
    var angle = (360/num)+1;
    var scene = document.querySelector('a-scene');
    var y = 10;
    var r = 5;
    var spiral = document.createElement('a-entity');
    var anim = document.createElement('a-animation');
    anim.setAttribute('attribute','rotation');
    anim.setAttribute('dur','600000');
    anim.setAttribute('fill','forwards');
    anim.setAttribute('to','0 360 0');
    anim.setAttribute('repeat','indefinite');
    anim.setAttribute('easing','linear');
    spiral.appendChild(anim);
    for(i = 0; i < num; i++){
        //mesh
        var x = r*Math.cos(angle*i);
        var z = r*Math.sin(angle*i);
        var s = document.createElement('a-sphere');
        s.setAttribute('radius', '.5');
        s.setAttribute('material', 'opacity', .6);
        s.setAttribute('id', 's'+i);
        s.setAttribute('color', environmentColor);
        s.setAttribute('position', x +' ' + y + ' ' + z);
        
        //sound
        if(i%20 == 0){
            var noise = document.createElement('a-sound');
            noise.setAttribute('src', '#s'+getRandomArbitrary(1, 6));
            noise.setAttribute('loop', 'false');
            noise.setAttribute('autoplay', 'true');
            s.appendChild(noise);
        }
        //next
        spiral.appendChild(s);
        y-=0.1;
        r+=0.1;
    }
    scene.appendChild(spiral);
};

function getRandomArbitrary(min, max) {
  return Math.round(Math.random() * (max - min) + min);
}