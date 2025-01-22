import * as THREE from 'three';
import {
    EffectComposer,
    FXAAShader,
    GLTFLoader,
    OrbitControls,
    OutlinePass,
    OutputPass,
    RenderPass,
    ShaderPass
} from "three/addons";


// PRIMARY SETUP //

//RENDERER
const renderer = new THREE.WebGLRenderer({
    antialias: true
});
renderer.shadowMap.enabled = true;
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setClearColor(0x49bce3);
document.getElementById('canvas').appendChild(renderer.domElement);

//ANTI-ALIAS EFFECT POST-PROCESS SHADER
let effectFXAA;

//SCENES
const scene = new THREE.Scene();
const sceneCube = new THREE.Scene();

//CAMERAS
const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth/window.innerHeight,
    0.1,
    1000
)
camera.position.set(0, 25, -30);

const cameraCube = new THREE.PerspectiveCamera(
    45,
    window.innerWidth/window.innerHeight,
    0.1,
    1000
)
cameraCube.position.set(0, 35, -30);

//EVENT LISTENERS
window.addEventListener('resize', function() {
    camera.aspect = window.innerWidth/window.innerHeight;
    camera.updateProjectionMatrix();
    cameraCube.aspect = window.innerWidth/window.innerHeight;
    cameraCube.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    effectFXAA.uniforms['resolution'].value.set(1/window.innerWidth, 1/window.innerHeight);
})

renderer.domElement.addEventListener('pointermove', onPointerMove)


// SECONDARY SETUPS //

//ORBIT CONTROLS
const orbit = new OrbitControls(camera, renderer.domElement);
orbit.maxPolarAngle = Math.PI / 2;
const orbitCube = new OrbitControls(cameraCube, renderer.domElement);
orbitCube.maxPolarAngle = Math.PI / 2;

//RAYCASTER
const raycaster = new THREE.Raycaster();

//MOUSE POSITION
const mousePosition = new THREE.Vector2();

//SELECTED OBJS ARRAY
let selectedObjs = [];
window.addEventListener('click', () => {
    if(selectedObjs.length > 0) {
        console.log(selectedObjs[0].name);
    }
})

// MISE-EN-SCENE //

//3D MODELS LOADER
const loader = new GLTFLoader();
const island = new URL('./src/island.glb', import.meta.url).href;
loader.load(island, function(gltf) {
    const model = gltf.scene;
    scene.add(model);
    model.position.set(0, 0, 0);
}, undefined, function(error) {
    console.log(error);
})
const meshes = ['ocean', 'island', 'beach', 'lighthouse', 'church', 'houses', 'fishermenVillage', 'dock'];

//MESHES
const boxGeometry = new THREE.BoxGeometry();
const boxMaterial = new THREE.MeshBasicMaterial({color: 0xFFFFFF});
const box = new THREE.Mesh(boxGeometry, boxMaterial);
sceneCube.add(box);

//LIGHTS
const ambient = new THREE.AmbientLight(0xffffff);
const directional = new THREE.DirectionalLight(0xffcc99, 2);
directional.position.set(30, 30, 0);
scene.add(ambient);
scene.add(directional);

const ambientCube = new THREE.AmbientLight(0xffffff);
const directionalCube = new THREE.DirectionalLight(0xffcc99, 2);
directionalCube.position.set(30, 30, 0);
sceneCube.add(ambientCube);
sceneCube.add(directionalCube);


// POST-PROCESSING //

//OUTLINE PP
const composer = new EffectComposer(renderer);

const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

const outlinePass = new OutlinePass(new THREE.Vector2(window.innerWidth, window.innerHeight), scene, camera);
outlinePass.hiddenEdgeColor.set(new THREE.Color().setHex( 0xffffff ));
outlinePass.edgeStrength = 7.5;
outlinePass.edgeGlow = 0;
outlinePass.edgeThickness = 1.5;
composer.addPass(outlinePass);

const outputPass = new OutputPass();
composer.addPass(outputPass);

effectFXAA = new ShaderPass(FXAAShader);
effectFXAA.uniforms['resolution'].value.set(1/window.innerWidth, 1/window.innerHeight);
composer.addPass(effectFXAA);


// ANIMATION LAUNCH //

renderer.setAnimationLoop(animate);


// FUNCTIONS //

function onPointerMove(event) {

    //MOUSE POSITION TRACKING + POSITION NORMALIZATION
    mousePosition.x = (event.clientX/window.innerWidth) * 2 - 1;
    mousePosition.y = -(event.clientY/window.innerHeight) * 2 + 1;
    //RAYCASTING
    raycaster.setFromCamera(mousePosition, camera);
    const intersectedObjs = raycaster.intersectObjects(scene.children);
    if (intersectedObjs.length > 0) {
        selectedObjs = [];
        selectedObjs.push(intersectedObjs[0].object);
        outlinePass.selectedObjects = selectedObjs;
        switch(intersectedObjs[0]?.object.name) {
            case 'ocean':
                showPlaceDescription( 'ocean');
                break;
            case 'island':
                showPlaceDescription( 'island');
                break;
            case 'beach':
                showPlaceDescription( 'beach');
                break;
            case 'lighthouse':
                showPlaceDescription( 'lighthouse');
                break;
            case 'church':
                showPlaceDescription( 'church');
                break;
            case 'houses':
                showPlaceDescription( 'houses');
                break;
            case 'fishermenVillage':
                showPlaceDescription( 'fishermenVillage');
                break;
            case 'dock':
                showPlaceDescription( 'dock');
                break;
            default:
                break;
        }
    } else {
        outlinePass.selectedObjects = [];
        hidePlaceDescription(meshes);
    }
}

function showPlaceDescription(placeName) {
    document.getElementById(placeName).classList.remove('hidden');
    hidePlaceDescription(meshes.filter(el => el !== placeName));
}

function hidePlaceDescription(arr) {
    arr.forEach(el => {
        const div = document.getElementById(el);
        !div.classList.contains('hidden') ? div.classList.add('hidden') : '';
    })
}

function animate() {
    composer.render(scene, camera);
    // renderer.render(scene, camera)
}
