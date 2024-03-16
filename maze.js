import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

function generateRandomMaze(width, height, depth) {
  const maze = [];

  // generate random coordinates for the start and end points
  const startX = Math.floor(Math.random() * width);
  const startY = Math.floor(Math.random() * height);
  const startZ = Math.floor(Math.random() * depth);

  const endX = Math.floor(Math.random() * width);
  const endY = Math.floor(Math.random() * height);
  const endZ = Math.floor(Math.random() * depth);

  for (let z = 0; z < depth; z++) {
    const level = [];
    for (let y = 0; y < height; y++) {
      const row = [];
      for (let x = 0; x < width; x++) {
        // randomly decide if this cell is a wall or not
        row.push(Math.random() < 0.2 ? '#' : ' ');

        // set the start and end points
        if (x === startX && y === startY && z === startZ) {
          row[x] = 'S';
        } else if (x === endX && y === endY && z === endZ) {
          row[x] = 'E';
        }
      }
      level.push(row);
    }
    maze.push(level);
  }

  return maze;
}

const maze = generateRandomMaze(9, 9, 9);

const mazeWidth = maze[0][0].length;
const mazeHeight = maze[0].length;
const mazeDepth = maze.length;

const createMaze = () => {
  const halfWidth = mazeWidth / 2;
  const halfHeight = mazeHeight / 2;
  const halfDepth = mazeDepth / 2;


  const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
  const wallMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
  const startMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const endMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
  const outerMaterial = new THREE.MeshBasicMaterial({color: 0x808080, transparent: true, opacity: 0.5});

  // create the maze
  for (let z = 0; z < mazeDepth; z++) {
    for (let y = 0; y < mazeHeight; y++) {
      for (let x = 0; x < mazeWidth; x++) {
        let material;

        if (maze[z][y][x] === '#') {
          material = wallMaterial;
        } else if (maze[z][y][x] === 'S') {
          material = startMaterial;
        } else if (maze[z][y][x] === 'E') {
          material = endMaterial;
        }

        if (material) {
          const cube = new THREE.Mesh(cubeGeometry, material);
          cube.position.set(x - halfWidth, y - halfHeight, z - halfDepth);
          scene.add(cube);

          // create outline on the cubes to make this easier to see
          const outlineGeometry = new THREE.BoxGeometry(1.05, 1.05, 1.05); // slightly larger than the cube
          const outlineMaterial = new THREE.MeshBasicMaterial({color: 0x000000, side: THREE.BackSide});
          const outlineCube = new THREE.Mesh(outlineGeometry, outlineMaterial);
          outlineCube.position.set(x - halfWidth, y - halfHeight, z - halfDepth);
          scene.add(outlineCube);
        }
        
      }
    }
  }

  // create the outer walls
  const outerGeometry = new THREE.BoxGeometry(mazeWidth+1, mazeHeight+1, mazeDepth+1);
  const outerCube = new THREE.Mesh(outerGeometry, outerMaterial);
  outerCube.position.set(-0.5, -0.5, -0.5); // Center the outer cube
  scene.add(outerCube);
};

createMaze();

camera.position.z = 10;
camera.position.y = 10;
camera.position.x = 10;

const controls = new OrbitControls(camera, renderer.domElement);
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();