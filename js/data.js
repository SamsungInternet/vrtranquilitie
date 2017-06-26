var loadedPlace = null;
var ambientSoundTag = null;
var currentPosition = null;
var smartCitizenData = null;
var coords = {'fr':{'coords':{'latitude':48.8566, 'longitude':2.3522}},
             'cr':{'coords':{'latitude':10.6267, 'longitude':-85.4437}},
             'sg':{'coords':{'latitude':1.3521, 'longitude':103.8198}},
             'kr':{'coords':{'latitude':37.5665, 'longitude':126.9780}},
             'us':{'coords':{'latitude':34.0522, 'longitude':-118.2437}},
             'uk':{'coords':{'latitude':51.5074, 'longitude':0.1278}}};

var start = function(place){
    //sets place
    loadedPlace = place;
    //hides splash screen
    document.querySelector('#userGesture').style.display = 'none';
    //readies ambient sound
    ambientSoundTag = document.querySelector('#street');
    playPromise = ambientSoundTag.play();
        if(playPromise !== undefined){
            playPromise.then(function(){
                
            }).catch(function(error){
                console.log('cant play');
            });
        }
        else{
            ambientSoundTag.pause();
        }
        //sets up skybox
        setupSky(loadedPlace);
        //gets current position
        getGeoLocation();
        //get configured coordinates
        if(loadedPlace != null){
            getSmartCitizenInfo(coords[loadedPlace]['coords']['latitude'], coords[loadedPlace]['coords']['longitude']);
        }
        else{
            getSmartCitizenInfo(currentPosition.coords.latitude, currentPosition.coords.longitude);
        }
        //creates spiral
        createSpiral(100);
        //creates splash screen
        createSplash();
        


    
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
    ampLevel = parseFloat((getLocalDecibels()/85).toPrecision(3)); //85dB is considered the limit for noise in 8h exposure
    console.log('amp level: '+ ampLevel);
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