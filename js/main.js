// Variables
let camera, scene, raycaster, renderer, intersect, sel_cubes;
let cubes_list = new Array();
var mouse = new THREE.Vector2();

var time_shown = 500;
var time_between = 250;
var delete_time = 200;
var new_game_time = 300;
var n_cubes = 10;

const mw = 9; // Map width
const mh = 9; // Map height
const size = 0.5; // Cube size

const waitFor = (ms) => new Promise(r => setTimeout(r, ms));
const loader = new THREE.FontLoader();
const grey = 'b0abab';
const red = 'ff0000';

init();
animate();
blinkRandomCubes(n_cubes);

function init() {
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x3f13fb);

    drawCubes();

    raycaster = new THREE.Raycaster();

    renderer = new THREE.WebGLRenderer({
        antialias: true
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    document.addEventListener('mousemove', onMouseMove, false)
    document.addEventListener('click', onMouseClick, false);
    window.addEventListener('resize', onWindowResize, false);
}

function drawCubes() {
    // All cubes share the same geometry and the same edge design
    const geometry = new THREE.BoxBufferGeometry(size, size, size);

    // Creating cubes
    for (let y = 0; y < mh; y++) {
        for (let x = 0; x < mw; x++) {
            const cube = new THREE.Mesh(
                geometry,
                new THREE.MeshBasicMaterial({
                    color: 0xb0abab
                })
            );

            cube.position.x = (1.5 * x - 6) / 2;
            cube.position.y = (6 - 1.5 * y) / 2;

            cube.name = `object_${x}_${y}`;
            cubes_list.push(cube.name);

            scene.add(cube);
        }
    }
}

function onMouseMove(event) {
    event.preventDefault();

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // finds intersections
    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(scene.children);

    if (intersects.length > 0) {
        if (intersect != intersects[0].object) {
            if (intersect) intersect.material = new THREE.MeshBasicMaterial({
                color: 0xb0abab
            });
            intersect = intersects[0].object;

            if (intersect.material.color.getHexString() == grey) {
                intersect.material = new THREE.MeshBasicMaterial({
                    color: 0xff0000
                });
            };
        }
    } else {
        if (intersect) intersect.material = new THREE.MeshBasicMaterial({
            color: 0xb0abab
        });
        intersect = null;
    }
}

async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
    }
}

function blinkRandomCubes(n) {
    sel_cubes = new Array(n),
        len = cubes_list.length,
        taken = new Array(len);
    if (n > len)
        throw new RangeError("getRandom: more elements taken than available");
    while (n--) {
        var x = Math.floor(Math.random() * len);
        sel_cubes[n] = cubes_list[x in taken ? taken[x] : x];
        taken[x] = --len in taken ? taken[len] : len;
    }

    const blink = async () => {
        await asyncForEach(sel_cubes, async (cube_name) => {
            var cube = scene.getObjectByName(cube_name);
            // console.log(cube.name);
            await waitFor(time_between);
            cube.material = new THREE.MeshBasicMaterial({
                color: 0xff0000
            });
            await waitFor(time_shown);
            cube.material = new THREE.MeshBasicMaterial({
                color: 0xb0abab
            });
            await waitFor(time_between);
        });
    }

    blink();
}

async function onMouseClick(event) {
    event.preventDefault();

    // finds intersections
    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(scene.children);

    let current_cube = sel_cubes[0];

    if (intersects.length > 0) {
        intersect = intersects[0].object;
        if (intersect.name == current_cube) {
            if (sel_cubes.length > 1) sel_cubes.shift();
            else {
                window.confirm("YOU WIN!")

                await waitFor(300);

                blinkRandomCubes(n_cubes);
            }
        } else {
            for (var i = scene.children.length - 1; i >= 0; i--) {
                obj = scene.children[i];
                scene.remove(obj);
            }

            await waitFor(200);

            window.confirm("GAME OVER!");

            await waitFor(300);

            drawCubes();
            animate();
            blinkRandomCubes(n_cubes);
        }
    }
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate, renderer.domElement);
    render();
}

function render() {
    scene.overrideMaterial = null;

    renderer.clear();
    renderer.render(scene, camera);
}
