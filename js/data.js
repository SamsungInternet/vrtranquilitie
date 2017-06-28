var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
var loadedPlace = null;
var ambientSoundTag = null;
var currentPosition = null;
var smartCitizenData = null;
var analyser = null;
var myDataArray = null;
var useMic = false;
var sample = null;
var ampLevel = 0;
var maxdB = 0;
var mindB = 120;
var sizeModifier = 2;
var coords = {'fr':{'coords':{'latitude':48.8566, 'longitude':2.3522}},
             'cr':{'coords':{'latitude':10.6267, 'longitude':-85.4437}},
             'sg':{'coords':{'latitude':1.3521, 'longitude':103.8198}},
             'kr':{'coords':{'latitude':37.5665, 'longitude':126.9780}},
             'us':{'coords':{'latitude':34.0522, 'longitude':-118.2437}},
             'uk':{'coords':{'latitude':51.5074, 'longitude':0.1278}},
             'mic':{'coords':{'latitude':34.0522, 'longitude':-118.2437}},
             'gps':{'coords':{'latitude':34.0522, 'longitude':-118.2437}},};

var start = function(place){
    //removes default sky (paris)
    document.getElementsByTagName('a-scene')[0].remove(document.getElementById('defStartSky'));
    //sets place
    loadedPlace = place;
    //hides splash screen
    document.querySelector('#splashBody').style.display = 'none';
    //readies sound
    stap = document.getElementById('tap');
    stap.play();
    //sets up skybox
    setupSky(loadedPlace);
    //get configured coordinates
    if(loadedPlace != null){
        getSmartCitizenInfo(coords[loadedPlace]['coords']['latitude'], coords[loadedPlace]['coords']['longitude']);
    }
    else{
        getSmartCitizenInfo(currentPosition.coords.latitude, currentPosition.coords.longitude);
    }

    //sets the audio
    
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
            getLocalDecibels();
            createSpiral(Math.round(maxdB));
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

//gets the decibels in the single nearest smartcitizen kit or in the area (average). once it is done it will give max and min dB as well
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
                        if(smartCitizenData[i].data.sensors[j].value < mindB){
                            mindB = smartCitizenData[i].data.sensors[j].value;
                        }
                        if(smartCitizenData[i].data.sensors[j].value > maxdB){
                            maxdB = smartCitizenData[i].data.sensors[j].value;
                        }
                        break;
                    }else{continue;}
                }
            }else{continue;}
        }else{break;}
    }
    console.log("local dB value: "+(db/cant).toPrecision(3));
    return parseFloat((db/cant).toPrecision(3));
};

//sets up collision detection on floor
var setCollision = function(){
    document.getElementById('floor');
    floor.addEventListener('collide', function(e){
        console.log('collide '+ e.detail.body.id);
    });
};

//creates the spiral shape
var createSpiral = function(num){
    var angle = (360/num)+1;
    var scene = document.querySelector('a-scene');
    var y = 30;
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
        s.setAttribute('radius', '.5' + ampLevel*ampLevel);
        console.log(ampLevel + 'this is the created amp level added');
        s.setAttribute('material', 'opacity', .55);
        s.setAttribute('id', 's'+i);
        s.setAttribute('position', x +' ' + y + ' ' + z);
        s.setAttribute('dynamic-body', '');
        s.addEventListener('collide', function(e){
            tap.play();
        });
        document.querySelector('a-scene').systems['boundary-checker'].registerMe(s);
        
        //sound
        if(i%20 == 0){
            var noise = document.createElement('a-sound');
            noise.setAttribute('src', '#s'+getRandomArbitrary(1, 6));
            noise.setAttribute('loop', 'true');
            noise.setAttribute('autoplay', 'false');
            s.appendChild(noise);
        }
        //next
        scene.appendChild(s);
        y-=0.2;
        r+=0.2;
    }
    scene.appendChild(spiral);
};

//gets a random number in a range
function getRandomArbitrary(min, max) {
    return Math.round(Math.random() * (max - min) + min);
}
