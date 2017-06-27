var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
var loadedPlace = null;
var ambientSoundTag = null;
var currentPosition = null;
var smartCitizenData = null;
var analyser = null;
var myDataArray = null;
var useMic = false;
var sample = null;
var ampLevel = 1;
var sizeModifier = 40;
var coords = {'fr':{'coords':{'latitude':48.8566, 'longitude':2.3522}},
             'cr':{'coords':{'latitude':10.6267, 'longitude':-85.4437}},
             'sg':{'coords':{'latitude':1.3521, 'longitude':103.8198}},
             'kr':{'coords':{'latitude':37.5665, 'longitude':126.9780}},
             'us':{'coords':{'latitude':34.0522, 'longitude':-118.2437}},
             'uk':{'coords':{'latitude':51.5074, 'longitude':0.1278}},
             'mic':{'coords':{'latitude':34.0522, 'longitude':-118.2437}},
             'gps':{'coords':{'latitude':34.0522, 'longitude':-118.2437}},};

var start = function(place){
    //gets current position
    getGeoLocation();
    //removes default sky (paris)
    document.getElementsByTagName('a-scene')[0].remove(document.getElementById('defStartSky'));
    //sets place
    loadedPlace = place;
    //hides splash screen
    document.querySelector('#splashBody').style.display = 'none';
    //readies ambient sound
    ambientSoundTag = document.querySelector('#street');
    
    
    /*
    playPromise = ambientSoundTag.play();
        if(playPromise !== undefined){
            playPromise.then(function(){
                ambientSoundTag.play();                
            }).catch(function(error){
                console.log('cant play');
            });
        }
        else{
            ambientSoundTag.play();
        }*/
        if(place != 'mic'){
            ambientSoundTag.play();
        }
        else{useMic = true;}

        //sets up skybox
        setupSky(loadedPlace);
        
        //get configured coordinates
        if(loadedPlace != null){
            getSmartCitizenInfo(coords[loadedPlace]['coords']['latitude'], coords[loadedPlace]['coords']['longitude']);
        }
        else{
            getSmartCitizenInfo(currentPosition.coords.latitude, currentPosition.coords.longitude);
        }
        //creates spiral
        createSpiral(100);
        //sets the audio
        setAudio(useMic);
        //start VR visuals
        window.requestAnimationFrame(visualize);

    
};

//sets up the initial skybox
var setupSky = function(tag){
    var skybg = document.createElement('a-image');
    skybg.setAttribute('id', 'sky');
    skybg.setAttribute('src', 'imgs/'+tag+'.jpg');
    document.getElementsByTagName('a-assets')[0].appendChild(skybg);
    scene = document.querySelector('a-scene');
    
    var sky = document.createElement('a-sky');
    sky.setAttribute('src', '#sky');
    scene.appendChild(sky);
};

//gets location
var getGeoLocation = function(){
    if ('geolocation' in navigator){
        navigator.geolocation.getCurrentPosition(function(ppos){
            currentPosition = ppos;
        }, function(error){currentPosition = {'coords':{'latitude':48.8566, 'longitude':2.3522}};});
    }
    else{
        currentPosition = {'coords':{'latitude':48.8566, 'longitude':2.3522}}; // default:Paris
    }
};

//gets the information form smartcitizen kits near a location
var getSmartCitizenInfo = function(lat, lon){
    dataReq = new XMLHttpRequest();
        dataReq.addEventListener('load', function(){
            let respData = JSON.parse(this.responseText);
            smartCitizenData = respData;
            amplifierLevel = getAmplifierLevel();
        });
        var req= 'https://api.smartcitizen.me/v0/devices/?near='+lat+','+lon;
        dataReq.open('GET', req);
        dataReq.send();
};

//gets the amplifier level for volume and size
var getAmplifierLevel = function(){
    ampLevel = parseFloat((getLocalDecibels()/85).toPrecision(3));
    console.log('amp level: '+ ampLevel);
    return ampLevel; //85dB is considered the limit for noise in 8h exposure
    
};

//gets the decibels in the single nearest smartcitizen kit or in the area (average)
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
    return parseFloat((db/cant).toPrecision(3));
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
        y-=0.2;
        r+=0.2;
    }
    scene.appendChild(spiral);
};

//gets a random number in a range
function getRandomArbitrary(min, max) {
    return Math.round(Math.random() * (max - min) + min);
}

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
            gainNode.gain.value = getAmplifierLevel();
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
        analyser.fftSize = 512;
        gainNode = audioCtx.createGain();
        //gainNode.gain.value = getAmplifierLevel();
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

//vr visualization loop
var visualize = function(){
    sample = document.getElementsByTagName('a-sphere');
    sampleFrequency();
     for(i = 0 ; i < sample.length; i++){
         if(myDataArray != null){
            if(Math.abs(myDataArray[64]) < 120){
                sample[i].setAttribute('radius',ampLevel*(Math.abs(myDataArray[64]/sizeModifier)));   
            }
                  
         }
     }
    window.requestAnimationFrame(visualize);
};