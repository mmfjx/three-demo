import Earth from './earth-3d.js';
var camera, scene, renderer,controls, earth
;

init();
animate();

function init() {

    camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 1, 1000 );
    camera.position.z = 200;
    scene = new THREE.Scene();

    var light = new THREE.AmbientLight( 0xffffff ); // soft white light
    scene.add( light );

    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );
    controls = new THREE.OrbitControls( camera, renderer.domElement );
    earth = new Earth(renderer, scene, camera);

    window.addEventListener( 'resize', onWindowResize, false );

}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

}

function animate() {

    requestAnimationFrame( animate );
    render();
    TWEEN.update();
}

function render() {
    renderer.render( scene, camera );
    controls.update();
    // update();

}
