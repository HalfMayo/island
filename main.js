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
    antialias: true,
    alpha: true
});
renderer.shadowMap.enabled = true;
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setClearColor(0x49bce3);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.domElement.id = 'ThreeScene';
document.getElementById('canvas').appendChild(renderer.domElement);

//SCENES
const scene = new THREE.Scene();
const sceneCube = new THREE.Scene();
let sceneToDisplay = scene;

//CAMERAS
const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth/window.innerHeight,
    0.1,
    1000
)
camera.position.set(0, 25, -30);

//PP VARIABLES
let selectedObjs = [];
let renderPass, outlinePass, outputPass, effectFXAA;

//EVENT LISTENERS
window.addEventListener('resize', function() {
    camera.aspect = window.innerWidth/window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    effectFXAA.uniforms['resolution'].value.set(1/window.innerWidth, 1/window.innerHeight);
})

document.getElementById('canvas').addEventListener('click', () => {
    if(selectedObjs.length > 0) {
        document.getElementById('ThreeScene').classList.add('fadeToBlack');
        renderer.domElement.removeEventListener('pointermove', onPointerMove);
        hidePlaceDescription(meshes);
        setTimeout(() => {
            sceneToDisplay = sceneCube;

            launchPostProcessing(composer);
            document.getElementById('back-button').classList.remove('hidden')
        }, 1000);
        setTimeout(() => {
            document.getElementById('ThreeScene').classList.remove('fadeToBlack');
            renderer.domElement.addEventListener('pointermove', onPointerMove);
        }, 2000)
    }
})

document.getElementById('back-button').addEventListener('click', () => {
    document.getElementById('ThreeScene').classList.add('fadeToBlack');
    renderer.domElement.removeEventListener('pointermove', onPointerMove);
    setTimeout(() => {
        sceneToDisplay = scene;
        outlinePass.selectedObjects = [];
        hidePlaceDescription(meshes);
        launchPostProcessing(composer);
        document.getElementById('back-button').classList.add('hidden');
    }, 1000)
    setTimeout(() => {
        document.getElementById('ThreeScene').classList.remove('fadeToBlack');
        renderer.domElement.addEventListener('pointermove', onPointerMove);
    }, 2000)
})

renderer.domElement.addEventListener('pointermove', onPointerMove)


// SECONDARY SETUPS //

//ORBIT CONTROLS
const orbit = new OrbitControls(camera, renderer.domElement);
orbit.maxPolarAngle = Math.PI / 2;

//RAYCASTER
const raycaster = new THREE.Raycaster();

//MOUSE POSITION
const mousePosition = new THREE.Vector2();


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
box.rotation.set(3, 5, 0);
sceneCube.add(box);

//LIGHTS
const ambient = new THREE.AmbientLight(0xffffff);
const directional = new THREE.DirectionalLight(0xffcc99, 2);
directional.position.set(30, 30, 0);
scene.add(ambient);
scene.add(directional);


// POST-PROCESSING //

//OUTLINE PP
const composer = new EffectComposer(renderer);
launchPostProcessing(composer);


// ANIMATION LAUNCH //

renderer.setAnimationLoop(animate);


// FUNCTIONS //

function onPointerMove(event) {

    //MOUSE POSITION TRACKING + POSITION NORMALIZATION
    mousePosition.x = (event.clientX/window.innerWidth) * 2 - 1;
    mousePosition.y = -(event.clientY/window.innerHeight) * 2 + 1;
    //RAYCASTING
    if(sceneToDisplay === scene) {
        raycaster.setFromCamera(mousePosition, camera);
        const intersectedObjs = raycaster.intersectObjects(sceneToDisplay.children);
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
            selectedObjs = [];
            hidePlaceDescription(meshes);
        }
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

function launchPostProcessing(composer) {
    renderPass = new RenderPass(sceneToDisplay, camera);
    composer.addPass(renderPass);

    outlinePass = new OutlinePass(new THREE.Vector2(window.innerWidth, window.innerHeight), sceneToDisplay, camera);
    outlinePass.hiddenEdgeColor.set(new THREE.Color().setHex( 0xffffff ));
    outlinePass.edgeStrength = 7.5;
    outlinePass.edgeGlow = 0;
    outlinePass.edgeThickness = 1.5;
    composer.addPass(outlinePass);

    outputPass = new OutputPass();
    composer.addPass(outputPass);

    effectFXAA = new ShaderPass(FXAAShader);
    effectFXAA.uniforms['resolution'].value.set(1/window.innerWidth, 1/window.innerHeight);
    composer.addPass(effectFXAA);
}

function animate() {
    composer.render(sceneToDisplay, camera);
}
