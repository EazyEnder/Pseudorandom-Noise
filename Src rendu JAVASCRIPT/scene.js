import * as THREE from 'three';

noise.seed(Math.random());

const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight);

document.body.appendChild(renderer.domElement);
renderer.setClearColor("rgba(111,151,165)");

const intensity = 1;
const light = new THREE.PointLight("rgba(239,233,208)", intensity);
light.position.set(50,50,50);
const ambient_light = new THREE.AmbientLight("rgba(111,151,165)", 0.1);

scene.add(ambient_light);
scene.add(light);

let plan_size = 1.5;
let geometry = new THREE.PlaneGeometry(plan_size*80,plan_size*80,plan_size*400,plan_size*400);
const material = new THREE.MeshPhongMaterial();
material.flatShading = true;
material.vertexColors = true;


const plan = new THREE.Mesh(geometry, material);
plan.rotation.x = Math.PI * -.5;

let window_ratio = window.innerWidth/window.innerHeight;
const camera = new THREE.OrthographicCamera(plan_size*-15*window_ratio,plan_size*15*window_ratio,plan_size*15,plan_size*-15,-100,1000);
camera.lookAt(-0.3,-1,-0.3);
camera.position.set(0,0,0);

const wireframe = new THREE.WireframeGeometry(geometry);
const line = new THREE.LineSegments( wireframe );
line.material.depthTest = true;
line.material.opacity = 0;
line.material.transparent = true;

const octaves = 6;
const lacunarity = 3;
const exponentiation = 2;
const height_wished = 100;
const persistance = 0.40;
function ComputeNoise(x, y) {
    const xs = x / 7;
    const ys = y / 7;
    let amplitude = 1.0;
    let frequency = 0.25;

    let normalization = amplitude;
    let total = 0;

    for (let o = 0; o < octaves; o++) {

        let noiseValue = noise.perlin2(xs * frequency, ys * frequency);
        total += noiseValue * amplitude;
        normalization += amplitude;
        amplitude *= persistance;

        frequency *= lacunarity;

    }

    total /= normalization;
    if (total != 0) { return Math.pow(total, exponentiation) * height_wished } else { return total };
}

var positionAttribute = geometry.attributes.position;

const geo_counts = positionAttribute.count;
geometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(geo_counts * 3), 3));

for (var i = 0; i < geo_counts; i++) {


    let x = positionAttribute.getX(i);
    let y = positionAttribute.getY(i);
    let z = positionAttribute.getZ(i);

    let dh = ComputeNoise(x, y);
    z += dh;

    let variation_color = Math.round(Math.random() * 10 - 5);
    if (dh > height_wished / 35) {
        geometry.attributes.color.setXYZ(i, (211 + variation_color) / 255, (211 + variation_color) / 255, (211 + variation_color) / 255);
    }
    else if (dh > height_wished / 75) {
        geometry.attributes.color.setXYZ(i, (104 + variation_color) / 255, (104 + variation_color) / 255, (104 + variation_color) / 255);
    } else if (dh > height_wished / 300) {
        variation_color -= 60 * noise.perlin2(x * 0.25, y * 0.25);
        geometry.attributes.color.setXYZ(i, (47 + variation_color) / 255, (81 + variation_color) / 255, (33 + variation_color) / 255);
    } else if (dh > height_wished / 500) {
        geometry.attributes.color.setXYZ(i, (85 + variation_color) / 255, (122 + variation_color) / 255, (224 + variation_color) / 255);
    } else {

        variation_color += 25 * noise.perlin2(x * 0.25, y * 0.25);

        geometry.attributes.color.setXYZ(i, (37 + variation_color) / 255, (72 + variation_color) / 255, (160 + variation_color) / 255);
    }




    positionAttribute.setXYZ(i, x, y, z);

}

plan.add(line);

scene.add(plan);

function animate(){

    requestAnimationFrame(animate);
    renderer.render(scene,camera);

}
animate();