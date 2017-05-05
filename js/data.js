if ('geolocation' in navigator){
    navigator.geolocation.getCurrentPosition(function(position){
        getDevicesNear(position.coords.latitude, position.coords.longitude);
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

function getDevicesNear(lat, long){
    dataReq = new XMLHttpRequest();
    dataReq.addEventListener('load', reqListener);
    dataReq.open('GET', 'https://api.smartcitizen.me/v0/devices?near='+lat+','+long);
    dataReq.send();
}