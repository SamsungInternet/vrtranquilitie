document.addEventListener('DOMContentLoaded', function() {
    var gps = document.createElement('a-image');
    gps.setAttribute('src', '#gps');
    gps.setAttribute('width', 1);
    gps.setAttribute('height', 1);
    gps.setAttribute('position', '1 2 -4');
    gps.setAttribute('onclick', 'console.log("concha gps")');

    var mic = document.createElement('a-image');
    mic.setAttribute('src', '#mic');
    mic.setAttribute('width', 1);
    mic.setAttribute('height', 1);
    mic.setAttribute('position', '-1 2 -4');
    mic.setAttribute('onclick', 'console.log("concha mic")');

    var sc = document.querySelector('a-scene');
    console.log('query selector: ' + sc);
    sc.appendChild(gps);
    sc.appendChild(mic);
});
