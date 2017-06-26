var workingDate = null;
var pos = null;
var audioCtx = null;
var _APPID = 'ca0164a4646ab31e6f171460d83340d3';
var myDataArray = null;
var scene = document.querySelector('a-scene');
var weather = null;
var smartCitizenData = null;
var analyser = null;
var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
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

var getGeoLocation = function(){
    //set location
    if ('geolocation' in navigator){
        navigator.geolocation.getCurrentPosition(function(ppos){
            pos = ppos;
            //setupEnvironment(loadedPlace, 100);
        }, function(error){pos = {'coords':{'latitude':48.8566, 'longitude':2.3522}};});
    }
    else{
        pos = {'coords':{'latitude':48.8566, 'longitude':2.3522}};
        //setupEnvironment(loadedPlace,100);
    }
};

//sets up the environment for vr
var setupEnvironment = function(skytag, cantObjs){
    loadedPlace = skytag;
    getSmartCitizenInfo(skytag);
    setupSky(skytag);
    createSpiral(cantObjs);
    createSplash();
    sample = document.getElementsByTagName('a-sphere');
};



var getAmplifierLevel = function(){
    ampLevel = parseFloat((getLocalDecibels()/85).toPrecision(3)); //85dB is considered the limit for noise in 8h exposure
    console.log('amp level: '+ ampLevel);
};

//creates the splash screen to start the VR experience
var createSplash = function(){
    splashBanner = document.createElement('a-entity');
    splashBanner.setAttribute('id','splashScreen');
    splashBanner.innerHTML = "<a-animation attribute=\"position\" dur=\"10000\" to=\"0 100 0\" begin=\"goAway\"></a-animation>";
    
    console.log(splashBanner);

    document.getElementsByTagName('a-scene')[0].appendChild(splashBanner);

    splash = document.createElement('a-image');
    splash.setAttribute('src', '#splash');
    splash.setAttribute('width', 2.2);
    splash.setAttribute('height', 4);
    splash.setAttribute('transparent', 'true');
    splash.setAttribute('position', '0.1 2 -3');
    document.querySelector('#splashScreen').appendChild(splash);

    btnGPS = document.createElement('a-image');
    btnGPS.setAttribute('id', 'gpsImage');
    btnGPS.setAttribute('src', '#gps');
    btnGPS.setAttribute('width', .7);
    btnGPS.setAttribute('height', .7);
    btnGPS.setAttribute('transparent', 'true');
    btnGPS.setAttribute('position', '0.45 1.6 -2.8');
    btnGPS.emit("btnTap", false, true);

    btnMic = document.createElement('a-image');
    btnMic.setAttribute('id', 'micImage');
    btnMic.setAttribute('src', '#mic');
    btnMic.setAttribute('width', .7);
    btnMic.setAttribute('height', .7);
    btnMic.setAttribute('transparent', 'true');
    btnMic.setAttribute('position', '-0.45 1.6 -2.8');
    
    document.querySelector('#splashScreen').appendChild(btnGPS);
    document.querySelector('#splashScreen').appendChild(btnMic);

    document.querySelector('#micImage').addEventListener('click', function(){
        document.querySelector('#splashScreen').emit('goAway');
        startVRExp(true);
    });
    document.querySelector('#gpsImage').addEventListener('click', function(){
        document.querySelector('#splashScreen').emit('goAway');
        startVRExp(false);
        playPromise;
    });


};

//starts the asnimation frame loop
var startVRExp = function(useMic){
    console.log('mic: ' + useMic);
    setAudio(useMic);
    window.requestAnimationFrame(visualize);
};

//visual loop for vr
var visualize = function(){
    sampleFrequency();
    for(i = 0 ; i < sample.length; i++){
        if(myDataArray != null){
            if(Math.abs(myDataArray[64]) < 120)
                 sample[i].setAttribute('radius',ampLevel*(Math.abs(myDataArray[64]/30)));
                 
        }
    }
    window.requestAnimationFrame(visualize);
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
            analyser.fftSize = 512;
            gainNode = audioCtx.createGain();
            gainNode.gain.value = ampLevel;
            myDataArray = new Float32Array(analyser.frequencyBinCount);
            analyser.getFloatFrequencyData(myDataArray); 
            //connect nodes
            source.connect(gainNode);
            gainNode.connect(analyser);
            analyser.connect(audioCtx.destination);
        }).catch(function(err){console.log(err);}); 
    }
    else{
        source = audioCtx.createMediaElementSource(ambientSoundTag);
        analyser = audioCtx.createAnalyser();
        analyser.fftSize = 1024;
        gainNode = audioCtx.createGain();
        gainNode.gain.value = ampLevel;
        myDataArray = new Float32Array(analyser.frequencyBinCount);
        analyser.getFloatFrequencyData(myDataArray); 
        //connect nodes
        source.connect(gainNode);
        gainNode.connect(analyser);
        analyser.connect(audioCtx.destination);
    }    
};

//samples the data from the audio source
var sampleFrequency = function(){
    if(analyser != null){
        myDataArray = new Float32Array(analyser.frequencyBinCount);
        analyser.getFloatFrequencyData(myDataArray);    
    }
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
            amplifierLevel = getAmplifierLevel();
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
    console.log("local dB value: "+(db/cant).toPrecision(3));
    return (db/cant).toPrecision(3);
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
        s.setAttribute('material', 'opacity', .55);
        s.setAttribute('id', 's'+i);
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

//gets a query string parameter
function getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    var results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
};