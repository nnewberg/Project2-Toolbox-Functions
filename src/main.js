
// Skybox texture from: https://github.com/mrdoob/three.js/tree/master/examples/textures/cube/skybox

const THREE = require('three'); // older modules are imported like this. You shouldn't have to worry about this much
import Framework from './framework'

var wing;
var feathers = [];
var params = {numFeathers: 20.0,
              featherDist: 0.25,
              featherCurvature: 0.5,
              featherSize: 1.0,
              wind: new THREE.Vector3(0,0,1.0),
              windSpeed: 1.0,
              color: 0x2956B2};
var time = 0.0;
var featherMesh;

function createFeathers(){
    create_top_layer(featherMesh, params.featherDist, params.numFeathers, 0.0, 
                    params.featherCurvature, params.featherSize);
    var featherDist = params.featherDist/2.0 + params.featherDist;
    var numFeathers = params.numFeathers - params.numFeathers/4.0;
    create_bottom_layer(featherMesh, featherDist, 0, numFeathers, 0.0, params.featherCurvature,
        params.featherSize);
}

function removeFeathers(){
for( var i = wing.children.length - 1; i >= 0; i--) { 
    wing.remove(wing.children[i]);
}

function ColorLuminance(hex, lum) {

    // validate hex string
    hex = String(hex).replace(/[^0-9a-f]/gi, '');
    if (hex.length < 6) {
        hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
    }
    lum = lum || 0;

    // convert to decimal and change luminosity
    var rgb = "#", c, i;
    for (i = 0; i < 3; i++) {
        c = parseInt(hex.substr(i*2,2), 16);
        c = Math.round(Math.min(Math.max(0, c + (c * lum)), 255)).toString(16);
        rgb += ("00"+c).substr(c.length);
    }

    return rgb;
}

}

function easeLinear(t, start, end, duration){
    return end * (t/duration) + start;
}

function ease_in_quadratic(t, start, end, duration){
    t = t/duration;
    t = t * t;
    return t * (end - start) + start
}

function impulse(k,x){
    var h = k*x;
    return h * Math.exp(1.0 - h);
}

function wingProfile(t, decay){
    return impulse(decay,t);
}

function create_top_layer(mesh, featherDist, numFeathers, steepness, featherCurvature, featherSize){
     for (var i = 0; i < featherDist*numFeathers; i+=featherDist){
        var featherMeshClone = mesh.clone();
        var duration = featherDist*numFeathers;
        var z_pos = ease_in_quadratic(i, 0, 1, duration);
        var y_pos = wingProfile(i, featherCurvature);
        featherMeshClone.position.set(i, y_pos, -z_pos);
        featherMeshClone.scale.set(featherSize,1,featherSize);
        var lum = easeLinear(i, 0, 0.6, duration);
        var baseColor = new THREE.Color(params.color);
        var featherMat = new THREE.MeshPhongMaterial( { 
            color: baseColor.addScalar(-lum), 
            specular: 0xaaaaaa,
            shininess: 6
        } ); 
        featherMeshClone.material = featherMat;
        var rot = easeLinear(i, 0.0, -90.0, duration);
        featherMeshClone.rotateY((Math.PI/180.0) *rot);
        wing.add(featherMeshClone);
        feathers.push(featherMeshClone);
    }
}

function create_bottom_layer(mesh, featherDist, offset, numFeathers, steepness, featherCurvature, featherSize){
     for (var i = 0; i < featherDist*numFeathers; i+=featherDist){
        var featherMeshClone = mesh.clone();
        var duration = featherDist*numFeathers;
        var z_pos = ease_in_quadratic(i, 0, 1, duration);
        var y_pos = wingProfile(i, featherCurvature);
        featherMeshClone.position.set(i, y_pos -0.1, -z_pos + offset);
        featherMeshClone.scale.set(1.5 * featherSize,1,2 * featherSize);
        var lum = ease_in_quadratic(i, 0, 0.5, duration/1.5);
        var featherMat = new THREE.MeshPhongMaterial( { 
            color: new THREE.Color(params.color).addScalar(-lum), 
            specular: 0xaaaaaa,
            shininess: 6
        } ); 
        featherMeshClone.material = featherMat;
        var rot = easeLinear(i, 0.0, -90.0, duration);
        featherMeshClone.rotateY((Math.PI/180.0) *rot);
        wing.add(featherMeshClone); 
        //feathers.push(featherMeshClone);
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
    var wingMat = new THREE.MeshPhongMaterial( { 
    color: 0x2956B2, 
    specular: 0xaaaaaa,
    shininess: 6
    } ); 
    // Set light
    var directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
    directionalLight.color.setHSL(0.1, 1, 0.95);
    directionalLight.position.set(1, 3, 2);
    directionalLight.position.multiplyScalar(10);

    // set skybox
    var loader = new THREE.CubeTextureLoader();
    var urlPrefix = 'images/skymap/';

    var skymap = new THREE.CubeTextureLoader().load([
        urlPrefix + 'px.jpg', urlPrefix + 'nx.jpg',
        urlPrefix + 'py.jpg', urlPrefix + 'ny.jpg',
        urlPrefix + 'pz.jpg', urlPrefix + 'nz.jpg'
    ] );

    scene.background = skymap;

    //parent wing object
    wing = new THREE.Object3D();
    wing.name = "wing";
    // load a simple obj mesh
    var objLoader = new THREE.OBJLoader();
    objLoader.load('geo/feather.obj', function(obj) {

        // LOOK: This function runs after the obj has finished loading

        var featherGeo = obj.children[0].geometry;
        featherMesh = new THREE.Mesh(featherGeo, wingMat);
        featherMesh.rotation.y = Math.PI / 2;
        featherMesh.rotation.z = Math.PI;

        wing.add(featherMesh);
        featherMesh.name = "feather";
        createFeathers();

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

    gui.add(params, 'numFeathers', 15, 35).onChange(function(newVal) {
        removeFeathers();
        createFeathers();
    });

    gui.add(params, 'featherDist', 0.1, 0.5).onChange(function(newVal) {
        removeFeathers();
        createFeathers();
    });

    gui.add(params, 'featherCurvature', 0, 1.0).onChange(function(newVal) {
        removeFeathers();
        createFeathers();
    });

    gui.add(params, 'featherSize', 0.5, 3.0).onChange(function(newVal) {
        removeFeathers();
        createFeathers();
    });

    gui.add(params, 'windSpeed', 0, 10.0).onChange(function(newVal) {
        removeFeathers();
        createFeathers();
    });

    gui.addColor(params, 'color').onChange(function(newVal) {
        removeFeathers();
        createFeathers();
    });
}

function animateWind(){
    feathers.forEach(function(feather) {
        feather.rotation.z = (Math.PI/180.0) * -params.windSpeed 
             * Math.sin((time/100));
});
}

// called on frame updates
function onUpdate(framework) {
    var wing = framework.scene.getObjectByName("wing");    
    if (wing !== undefined) {
        // Simply flap wing
        var date = new Date();
        time = date.getTime();
        wing.rotateZ(Math.sin(date.getTime() / 200) * 1.2*Math.PI / 180);
        animateWind();     
    }
}

// when the scene is done initializing, it will call onLoad, then on frame updates, call onUpdate
Framework.init(onLoad, onUpdate);