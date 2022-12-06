import * as THREE from 'three';
import {OrbitControls} from 'https://threejsfundamentals.org/threejs/resources/threejs/r122/examples/jsm/controls/OrbitControls.js';
import {Worley} from '/js/worley.js';

noise.seed(Math.random());

var worleynoise = new Worley();

const resolution_details = 1000;

const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight);

document.body.appendChild(renderer.domElement);
renderer.setClearColor("rgba(10,10,10)");

const intensity = 2;
const light = new THREE.PointLight("rgba(239,233,208)", intensity);
light.position.set(100,0,0);
const ambient_light = new THREE.AmbientLight("rgba(111,151,165)", 0.1);

 scene.add(ambient_light);
// scene.add(light);

let geometry = new THREE.SphereGeometry(3,resolution_details,resolution_details);
const material = new THREE.MeshPhongMaterial({color:"gray"});
material.vertexColors = true;
material.shininess = 0;
material.vertexAlphas = true;
material.transparent = true;


const sphere = new THREE.Mesh(geometry, material);

let window_ratio = window.innerWidth/window.innerHeight;
const camera = new THREE.PerspectiveCamera(50, window_ratio, 0.1, 1250);
camera.position.set(8,0,0);
camera.lookAt(0,0,0);

// const wireframe = new THREE.WireframeGeometry(geometry);
// const line = new THREE.LineSegments( wireframe );
// line.material.depthTest = true;
// line.material.opacity = 0.2;
// line.material.transparent = true;

const octaves = 6;
const lacunarity = 0.5;
const exponentiation = 2;
const height_wished = 100;
const persistance = 0.40;
console.log(worleynoise.Euclidean(1,1,1)[0])
function ComputeNoise(x, y, z) {
    const xs = x / 7;
    const ys = y / 7;
    const zs = z / 7;
    let amplitude = 1.0;
    let frequency = 35;

    let normalization = amplitude;
    let total = 0;
    let noiseValue = worleynoise.Euclidean(xs*frequency,ys*frequency,zs*frequency)[1]-worleynoise.Euclidean(xs*frequency,ys*frequency,zs*frequency)[0];
    frequency *= lacunarity;
    noiseValue += worleynoise.Euclidean(xs*frequency,ys*frequency,zs*frequency)[1]-worleynoise.Euclidean(xs*frequency,ys*frequency,zs*frequency)[0] * 0.7;

    total += noiseValue *0.75;

    return total;
}

const controls = new OrbitControls( camera, renderer.domElement );
controls.enablePan = false;
controls.maxDistance = 12;
controls.minDistance = 6;

var positionAttribute = geometry.attributes.position;

const geo_counts = positionAttribute.count;
geometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(geo_counts * 3), 3));

for (var i = 0; i < geo_counts; i++) {

    let x = positionAttribute.getX(i);
    let y = positionAttribute.getY(i);
    let z = positionAttribute.getZ(i);

    let modif = 0.2;
    let dh = ComputeNoise(x, y, z);
    let pos_norm = Math.sqrt(Math.pow(x,2)+Math.pow(y,2)+Math.pow(z,2));
    //if(dh < 0){dh = 0;}
    let vect = [x/pos_norm * dh,y/pos_norm * dh,z/pos_norm * dh];

    let variation_color = Math.round(Math.random() * 10 - 5);

        variation_color += 25 * noise.perlin2(x * 0.25, y * 0.25);

        geometry.attributes.color.setXYZ(i, 160*dh, 50*dh, 0*dh);




    positionAttribute.setXYZ(i, x+vect[0]*modif, y+vect[1]*modif, z+vect[2]*modif);

}

let skybox_name = "SS_01_05_";

const loader = new THREE.CubeTextureLoader();
  const texture = loader.load([
    'img/skybox/' + skybox_name + 'left.png',
    'img/skybox/' + skybox_name + 'right.png',
    'img/skybox/' + skybox_name + 'up.png',
    'img/skybox/' + skybox_name + 'down.png',
    'img/skybox/' + skybox_name + 'front.png',
    'img/skybox/' + skybox_name + 'back.png',
  ]);
scene.background = texture;

//sphere.add(line);
scene.add(sphere);

var seedchoose = 3000;
function animate(){

    sphere.rotation.y -= 2*Math.PI / 180 /60;

    requestAnimationFrame(animate);
    renderer.render(scene,camera);

}
animate();