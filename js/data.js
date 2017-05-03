if ('geolocation' in navigator){
    navigator.geolocation.getCurrentPosition(function(position){
        console.log(position.coords.latitude, position.coords.longitude, position.coords.altitude);
    });
}
else{
    console.log('using default position // Paris');
}

document.addEventListener('DOMContentLoaded', function() {
       
});

function reqListener() {
    console.log(this.responseText);
}

var dataReq = new XMLHttpRequest();
dataReq.addEventListener('load', reqListener);
dataReq.open('GET', 'https://api.smartcitizen.me/v0/devices');
dataReq.send();