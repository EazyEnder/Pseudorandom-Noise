import * as THREE from 'three';
import {OrbitControls} from 'https://threejsfundamentals.org/threejs/resources/threejs/r122/examples/jsm/controls/OrbitControls.js';
import {Planet} from "/objects/Planet.js";

noise.seed(Math.random());

const resolution_details = 3000;

const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight);

document.body.appendChild(renderer.domElement);
renderer.setClearColor("rgba(10,10,10)");

const intensity = 2;
const light = new THREE.PointLight("rgba(239,233,208)", intensity);
light.position.set(100,0,0);
const ambient_light = new THREE.AmbientLight("rgba(111,151,165)", 0.2);

scene.add(ambient_light);
scene.add(light);

let geometry = new THREE.SphereGeometry(3,resolution_details,resolution_details);
const material = new THREE.MeshPhongMaterial({color:"gray"});
material.flatShading = true;
material.vertexColors = true;
material.shininess = 0;
material.vertexAlphas = true;
material.transparent = true;
material.side = THREE.DoubleSide;

let geometry_clouds = new THREE.SphereGeometry(3.1,resolution_details/3,resolution_details/3);
const material_clouds = material.clone();
material_clouds.flatShading = false;

const sphere = new THREE.Mesh(geometry, material);
const clouds = new THREE.Mesh(geometry_clouds, material_clouds);

let window_ratio = window.innerWidth/window.innerHeight;
const camera = new THREE.PerspectiveCamera(50, window_ratio, 0.1, 7000);
camera.position.set(8,0,0);
camera.lookAt(0,0,0);

// const wireframe = new THREE.WireframeGeometry(geometry);
// const line = new THREE.LineSegments( wireframe );
// line.material.depthTest = true;
// line.material.opacity = 0.2;
// line.material.transparent = true;

const controls = new OrbitControls( camera, renderer.domElement );
controls.enablePan = false;
controls.maxDistance = 12;
controls.minDistance = 6;

var positionAttribute = geometry.attributes.position;
const geo_counts = positionAttribute.count;
geometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(geo_counts * 3), 3));

var positionAttribute_clouds = geometry_clouds.attributes.position;
const geo_counts_clouds = positionAttribute_clouds.count;
geometry_clouds.setAttribute('color', new THREE.BufferAttribute(new Float32Array(geo_counts_clouds * 4), 4));

console.log(Planet)
var Terre = new Planet("Terre",1.2*6*Math.pow(10,24),6000,1,1,[""]);
Terre.GenerateTexture(geometry,geometry_clouds);

for (var i = 0; i < geo_counts_clouds; i++) {

    let x = positionAttribute_clouds.getX(i);
    let y = positionAttribute_clouds.getY(i);
    let z = positionAttribute_clouds.getZ(i);

    let clouds_alpha = Math.abs(noise.perlin3(x/2,y*3,z/2)) * 2;
    clouds_alpha = Math.pow(clouds_alpha,2) + 0.5;

    let variation_color = Math.round(Math.random() * 10 - 5);
    geometry_clouds.attributes.color.setXYZW(i, (200 + variation_color) / 255, (200 + variation_color) / 255, (200 + variation_color) / 255, clouds_alpha);



    positionAttribute_clouds.setXYZ(i, x, y, z);

}

let skybox_name = "SS_01_03_";

const loadManager = new THREE.LoadingManager();
const loader = new THREE.TextureLoader(loadManager);
//   const texture = loader.load([
//     'img/skybox/' + skybox_name + 'left.png',
//     'img/skybox/' + skybox_name + 'right.png',
//     'img/skybox/' + skybox_name + 'up.png',
//     'img/skybox/' + skybox_name + 'down.png',
//     'img/skybox/' + skybox_name + 'front.png',
//     'img/skybox/' + skybox_name + 'back.png'
//   ]);
//scene.background = texture;

var urls = [
    'img/skybox/' + skybox_name + 'left.png',
    'img/skybox/' + skybox_name + 'right.png',
    'img/skybox/' + skybox_name + 'up.png',
    'img/skybox/' + skybox_name + 'down.png',
    'img/skybox/' + skybox_name + 'front.png',
    'img/skybox/' + skybox_name + 'back.png'
  ];

var materialArray = [];
for (var i = 0; i < 6; i++){
materialArray.push( new THREE.MeshBasicMaterial({
//map: loader.load( urls[i] ),
side: THREE.BackSide,
color: "rgb(0,255,0)"
}));
}

loadManager.onLoad = () => {
var skyGeometry = new THREE.BoxGeometry( 1000, 1000, 1000 );
var skybox_mesh = new THREE.Mesh( skyGeometry, materialArray );

skybox_mesh.rotation.x -= Math.PI / 3;
skybox_mesh.rotation.z += Math.PI / 3;

scene.add(skybox_mesh);
};

//sphere.add(line);
//sphere.add(clouds);
scene.add(sphere);

function animate(){

    clouds.rotation.y -= 5*Math.PI / 180 /60;
    sphere.rotation.y -= 2*Math.PI / 180 /60;

    requestAnimationFrame(animate);
    renderer.render(scene,camera);

}
animate();