import * as THREE from 'three';
import {GLTFLoader, OrbitControls} from "three/addons";

//SETUP (RENDERER, SCENE, CAMERA)
const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.shadowMap.enabled = true;
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setClearColor(0x49bce3);
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth/window.innerHeight,
    0.1,
    1000
)
camera.position.set(0, 25, -30);

window.addEventListener('resize', function() {
    camera.aspect = window.innerWidth/window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight)
})

//ORBIT CONTROLS
const orbit = new OrbitControls(camera, renderer.domElement)

//RAYCASTER
const raycaster = new THREE.Raycaster();

//MOUSE POSITION TRACKING + POSITION NORMLIZATION
const mousePosition = new THREE.Vector2();
window.addEventListener('mousemove', function(e) {
    mousePosition.x = (e.clientX/window.innerWidth) * 2 - 1;
    mousePosition.y = -(e.clientY/window.innerHeight) * 2 + 1;
});

//3D MODELS LOADER
const loader = new GLTFLoader();
const island = new URL('./src/island.glb', import.meta.url).href;
loader.load(island, function(gltf) {
    const model = gltf.scene;
    scene.add(model);
    model.position.set(0, 0, 0);
    model.rotation.set(0, Math.PI / 6, 0);
}, undefined, function(error) {
    console.log(error);
})

//LIGHTS
const ambient = new THREE.AmbientLight(0xffffff);
const directional = new THREE.DirectionalLight(0xFFFFFF, 0.5);
directional.position.set(30, 30, 0);
scene.add(ambient);
scene.add(directional)

function animate() {
    renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);

