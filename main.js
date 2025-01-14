import * as THREE from 'three';
import {OrbitControls} from "three/addons";

//SETUP (RENDERER, SCENE, CAMERA)
const renderer = new THREE.WebGLRenderer({antialias: true});
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
camera.position.set(-10, 30, 30);

window.addEventListener('resize', function() {
    camera.aspect = window.innerWidth/window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight)
})

//ORBIT CONTROLS
const orbit = new OrbitControls(camera, renderer.domElement)
orbit.update();

//RAYCASTER
const raycaster = new THREE.Raycaster();

//MOUSE POSITION TRACKING + POSITION NORMLIZATION
const mousePosition = new THREE.Vector2();
window.addEventListener('mousemove', function(e) {
    mousePosition.x = (e.clientX/window.innerWidth) * 2 - 1;
    mousePosition.y = -(e.clientY/window.innerHeight) * 2 + 1;
});

//MESHES
const boxGeometry = new THREE.BoxGeometry(1,1,1);
const boxMaterial = new THREE.MeshBasicMaterial({color: 0xFFFFFF});
const box = new THREE.Mesh(boxGeometry, boxMaterial);
scene.add(box);

function animate() {
    renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);

