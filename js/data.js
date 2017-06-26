var loadedPlace = null;
var ambientSoundTag = null;

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
            //ambientSoundTag.pause();
        }
        //sets up skybox
        setupSky(loadedPlace);

    
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