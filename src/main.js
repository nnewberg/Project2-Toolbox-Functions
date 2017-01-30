
// Skybox texture from: https://github.com/mrdoob/three.js/tree/master/examples/textures/cube/skybox

const THREE = require('three'); // older modules are imported like this. You shouldn't have to worry about this much
import Framework from './framework'


function easeLinear(t, start, end, duration){
    return end * (t/duration) + start;
}

function ease_in_quadratic(t, start, end, duration){
    t = t/duration;
    t = t * t;
    return t * (end - start) + start
}

function create_top_layer(wing, mesh, featherDist, numFeathers, steepness){
     for (var i = 0; i < featherDist*numFeathers; i+=featherDist){
        var featherMeshClone = mesh.clone();
        var duration = featherDist*numFeathers;
        var z_pos = ease_in_quadratic(i, 0, 1, duration);
        featherMeshClone.position.set(i, 0, -z_pos);
        var rot = easeLinear(i, 0.0, -90.0, duration);
        featherMeshClone.rotateY((Math.PI/180.0) *rot)
        wing.add(featherMeshClone);  
    }
}

function create_bottom_layer(wing, mesh, featherDist, offset, numFeathers, steepness){
     for (var i = 0; i < featherDist*numFeathers; i+=featherDist){
        var featherMeshClone = mesh.clone();
        var duration = featherDist*numFeathers;
        var z_pos = ease_in_quadratic(i, 0, 1, duration);
        featherMeshClone.position.set(i, -0.1, -z_pos + offset);
        featherMeshClone.scale.set(1.5,1,2);
        var rot = easeLinear(i, 0.0, -90.0, duration);
        featherMeshClone.rotateY((Math.PI/180.0) *rot)
        wing.add(featherMeshClone);  
    }
}

// called after the scene loads
function onLoad(framework) {
    var scene = framework.scene;
    var camera = framework.camera;
    var renderer = framework.renderer;
    var gui = framework.gui;
    var stats = framework.stats;

    // Basic Lambert white
    var lambertWhite = new THREE.MeshLambertMaterial({ color: 0xaaaaaa, side: THREE.DoubleSide });

    // Set light
    var directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
    directionalLight.color.setHSL(0.1, 1, 0.95);
    directionalLight.position.set(1, 3, 2);
    directionalLight.position.multiplyScalar(10);

    // set skybox
    var loader = new THREE.CubeTextureLoader();
    var urlPrefix = '/images/skymap/';

    var skymap = new THREE.CubeTextureLoader().load([
        urlPrefix + 'px.jpg', urlPrefix + 'nx.jpg',
        urlPrefix + 'py.jpg', urlPrefix + 'ny.jpg',
        urlPrefix + 'pz.jpg', urlPrefix + 'nz.jpg'
    ] );

    scene.background = skymap;

    //parent wing object
    var wing = new THREE.Object3D();
    wing.name = "wing";
    // load a simple obj mesh
    var objLoader = new THREE.OBJLoader();
    objLoader.load('/geo/feather.obj', function(obj) {

        // LOOK: This function runs after the obj has finished loading

        var featherGeo = obj.children[0].geometry;
        var featherMesh = new THREE.Mesh(featherGeo, lambertWhite);
        featherMesh.rotation.y = Math.PI / 2;
        featherMesh.rotation.z = Math.PI;

        wing.add(featherMesh);
        featherMesh.name = "feather";
        var featherDist = 0.25;
        var numFeathers = 20.0;
        var steepness = 15.0; //lower is steeper
        create_top_layer(wing, featherMesh, featherDist, numFeathers, steepness);
        featherDist = 0.35;
        numFeathers = 15.0;
        steepness = 12.0; //lower is steeper
        create_bottom_layer(wing, featherMesh, featherDist, 0, numFeathers, steepness);

    });
    scene.add(wing);

    // set camera position
    camera.position.set(0, 1, 5);
    camera.lookAt(new THREE.Vector3(0,0,0));

    // scene.add(lambertCube);
    scene.add(directionalLight);

    // edit params and listen to changes like this
    // more information here: https://workshop.chromeexperiments.com/examples/gui/#1--Basic-Usage
    gui.add(camera, 'fov', 0, 180).onChange(function(newVal) {
        camera.updateProjectionMatrix();
    });
}

// called on frame updates
function onUpdate(framework) {
    var wing = framework.scene.getObjectByName("wing");    
    if (wing !== undefined) {
        // Simply flap wing
        var date = new Date();
        wing.rotateX(Math.sin(date.getTime() / 100) * 2 * Math.PI / 180);        
    }
}

// when the scene is done initializing, it will call onLoad, then on frame updates, call onUpdate
Framework.init(onLoad, onUpdate);