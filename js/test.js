document.addEventListener('DOMContentLoaded', function() {
    var gps = document.createElement('a-image');
    gps.setAttribute('src', '#gps');
    gps.setAttribute('width', 1);
    gps.setAttribute('height', 1);
    gps.setAttribute('position', '1 2 -4');
    gps.setAttribute('onclick', 'startsampling');

    var sc = document.querySelector('a-scene');
    sc.appendChild(gps);
});
