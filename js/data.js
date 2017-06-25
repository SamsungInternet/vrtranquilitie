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
var speakerRepScale = 15;
var sample = null;
var ambientSoundTag = document.querySelector('#street');
var usingMic = false; 

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
    ambientSoundTag = document.querySelector('#street');
});

//sets up the environment for vr
var setupEnvironment = function(){
    getSmartCitizenInfo();
    //setAudio(false);
    setupSky();
    createSpiral(95);
    createSplash();
    sample = document.getElementsByTagName('a-sphere');
};

//creates the splash screen to start the VR experience
var createSplash = function(){
    

    splash = document.createElement('a-image');
    splash.setAttribute('src', '#splash');
    splash.setAttribute('width', 2.2);
    splash.setAttribute('height', 4);
    splash.setAttribute('transparent', 'true');
    splash.setAttribute('position', '0.1 2 -3');
    document.querySelector('a-scene').appendChild(splash);

    btnGPS = document.createElement('a-image');
    btnGPS.setAttribute('id', 'gpsImage');
    btnGPS.setAttribute('src', '#gps');
    btnGPS.setAttribute('width', .7);
    btnGPS.setAttribute('height', .7);
    btnGPS.setAttribute('transparent', 'true');
    btnGPS.setAttribute('position', '0.45 1.6 -2.8');
    btnGPS.emit("btnTap", false, true);
    btnGPS.setAttribute('onclick', 'startVRExp(false)');

    btnMic = document.createElement('a-image');
    btnMic.setAttribute('id', 'micImage');
    btnMic.setAttribute('src', '#mic');
    btnMic.setAttribute('width', .7);
    btnMic.setAttribute('height', .7);
    btnMic.setAttribute('transparent', 'true');
    btnMic.setAttribute('position', '-0.45 1.6 -2.8');
    btnMic.setAttribute('onclick', 'startVRExp(true)');
    
    document.querySelector('a-scene').appendChild(btnGPS);
    document.querySelector('a-scene').appendChild(btnMic);

    document.querySelector('#micImage').addEventListener('click', function(){alert('mic')});
    document.querySelector('#gpsImage').addEventListener('click', function(){alert('gps')});

};

//starts the asnimation frame loop
var startVRExp = function(useMic){
    setAudio(useMic);
    startSpiralSounds(useMic); 
    window.requestAnimationFrame(visualize);
};

var startSpiralSounds = function(){
    if(!usingMic)
        ambientSoundTag.play();
};

//visual loop for vr
var visualize = function(){
    sampleFrequency();
    for(i = 0 ; i < sample.length; i++){
        if(myDataArray[64] != Number.NEGATIVE_INFINITY)
        sample[i].setAttribute('radius', myDataArray[64]/speakerRepScale);
    }
    window.requestAnimationFrame(visualize);
};

//sets up the initial skybox
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
    usingMic = useMic;
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

//samples the data from the audio source
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
        s.setAttribute('color', environmentColor);
        s.setAttribute('position', x +' ' + y + ' ' + z);
        scene.appendChild(s);
    }
};

//creates the spiral shape
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
            noise.setAttribute('loop', 'true');
            noise.setAttribute('autoplay', 'false');
            s.appendChild(noise);
        }
        //next
        spiral.appendChild(s);
        y-=0.1;
        r+=0.1;
    }
    scene.appendChild(spiral);
};

//gets a random number in a range
function getRandomArbitrary(min, max) {
  return Math.round(Math.random() * (max - min) + min);
}