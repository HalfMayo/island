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


renderer.setAnimationLoop(animate);

function animate() {
    renderer.render(scene, camera);

    raycaster.setFromCamera(mousePosition, camera);
    const intersectedObjs = raycaster.intersectObjects(scene.children);
    const meshes = ['ocean', 'island', 'beach', 'lighthouse', 'church', 'houses', 'fishBarracks', 'dock'];
    switch(intersectedObjs[0]?.object.name) {
        case 'ocean':
            outline(meshes, intersectedObjs, 'ocean');
            break;
        case 'island':
            outline(meshes, intersectedObjs, 'island');
            break;
        case 'beach':
            outline(meshes, intersectedObjs, 'beach');
            break;
        case 'lighthouse':
            outline(meshes, intersectedObjs, 'lighthouse');
            break;
        case 'church':
            outline(meshes, intersectedObjs, 'church');
            break;
        case 'houses':
            outline(meshes, intersectedObjs, 'houses');
            break;
        case 'fishBarracks':
            outline(meshes, intersectedObjs, 'fishBarracks');
            break;
        case 'dock':
            outline(meshes, intersectedObjs, 'dock');
            break;
        default:
            meshes.forEach(el => removeOutline(el));
    }
}

function outline(meshes, objsArr, meshName) {
    const outlineName = meshName + 'Outline';

    const otherMeshes = meshes.slice();
    otherMeshes.splice(otherMeshes.indexOf(meshName), 1);
    otherMeshes.forEach(el => removeOutline(el));

    if(objsArr[0]?.object.name === meshName) {
        const outline = scene.getObjectByName(outlineName);
        if(!outline) {
            const outlineMaterial = new THREE.MeshBasicMaterial({color: 0xffffff, side: THREE.BackSide});
            const outlineMesh = new THREE.Mesh(objsArr[0]?.object.geometry, outlineMaterial);
            scene.updateMatrixWorld(true);
            const position = new THREE.Vector3();
            position.setFromMatrixPosition(objsArr[0].object.matrixWorld);
            outlineMesh.position.set(position.x, position.y, position.z);
            outlineMesh.rotation.set(0, Math.PI / 6, 0);
            outlineMesh.scale.set(1.025, 1.025, 1.025);
            outlineMesh.name = outlineName;
            scene.add(outlineMesh);
        }
    }
}

function removeOutline(meshName) {
    const outlineName = meshName + 'Outline'
    const outline = scene.getObjectByName(outlineName);
    if(outline) {
        scene.remove(outline)
    }
}
