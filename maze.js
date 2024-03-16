import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer();

export function main(mazeWidth, mazeHeight, mazeDepth) {
  function generateRandomMaze() {
    const maze = [];
  
    for (let z = 0; z < mazeDepth; z++) {
      const level = [];
      for (let y = 0; y < mazeHeight; y++) {
        const row = [];
        for (let x = 0; x < mazeWidth; x++) {
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
  
  const renderMaze = () => {
    const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
    const wallMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const startMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const endMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
  
    // render the maze
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
  
            // render outline on the cubes to make this easier to see
            const outlineGeometry = new THREE.BoxGeometry(1.05, 1.05, 1.05); // slightly larger than the cube
            const outlineMaterial = new THREE.MeshBasicMaterial({color: 0x000000, side: THREE.BackSide});
            const outlineCube = new THREE.Mesh(outlineGeometry, outlineMaterial);
            outlineCube.position.set(x - halfWidth, y - halfHeight, z - halfDepth);
            scene.add(outlineCube);
          }
          
        }
      }
    }
  
    // render the outer walls
    const outerMaterial = new THREE.MeshBasicMaterial({color: 0x808080, transparent: true, opacity: 0.5});
    const outerGeometry = new THREE.BoxGeometry(mazeWidth+1, mazeHeight+1, mazeDepth+1);
    const outerCube = new THREE.Mesh(outerGeometry, outerMaterial);
    outerCube.position.set(-0.5, -0.5, -0.5); // center the outer cube
    scene.add(outerCube);
  };
  
  function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  }
  
  async function dfs(x, y, z) {
    // check if the current position is out of bounds or a wall
    if (x < 0 || y < 0 || z < 0 || x >= mazeWidth || y >= mazeHeight || z >= mazeDepth || maze[z][y][x] === '#' || maze[z][y][x] === 'v') {
      return false;
    }
  
    // current spot set as visited
    maze[z][y][x] = 'v';
  
    // render the path
    const pathCube = new THREE.Mesh(pathGeometry, pathMaterial);
    pathCube.position.set(x - halfWidth, y - halfHeight, z - halfDepth);
    scene.add(pathCube);

    if (x === endX && y === endY && z === endZ) {
      return true; //check if we found the end
    }
  
    const directions = [
      [-1, 0, 0], // left
      [1, 0, 0],  // right
      [0, -1, 0], // down
      [0, 1, 0],  // up
      [0, 0, -1], // backward
      [0, 0, 1]   // forward
    ];
    
    // deplay for visual effect
    await new Promise(resolve => setTimeout(resolve, 50));

    for (const [dx, dy, dz] of directions) {
      if (await dfs(x + dx, y + dy, z + dz)) {
        return true;
      }
    }
  
    // if no path was found, remove the cube from the scene
    scene.remove(pathCube);
  
    return false;
  }

  // *** main script below ***

  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  const controls = new OrbitControls(camera, renderer.domElement);
  const pathMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff });
  const pathGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5); // Smaller cube for the path
  //const distanceThreshold = 4;

  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.zoomSpeed = 1;
  controls.maxDistance = 50;
  controls.rotateSpeed = 0.5;
  camera.position.z = 10;
  camera.position.y = 10;
  camera.position.x = 10;

  const startX = Math.floor(Math.random() * mazeWidth);
  const startY = Math.floor(Math.random() * mazeHeight);
  const startZ = Math.floor(Math.random() * mazeDepth);
  const endX = Math.floor(Math.random() * mazeWidth);
  const endY = Math.floor(Math.random() * mazeHeight);
  const endZ = Math.floor(Math.random() * mazeDepth);

  const maze = generateRandomMaze(mazeWidth, mazeHeight, mazeDepth);

  const halfWidth = mazeWidth / 2;
  const halfHeight = mazeHeight / 2;
  const halfDepth = mazeDepth / 2;

  renderMaze();
  animate();

  dfs(startX, startY, startZ);
}

export function reset(width, height, depth) {
  // Clear the previous maze
  const oldCanvas = document.querySelector('canvas');
  if (oldCanvas) {
    document.body.removeChild(oldCanvas);
  }
  document.body.appendChild(renderer.domElement);
  while(scene.children.length > 0){ 
    scene.remove(scene.children[0]); 
  }
  main(width, height, depth);
}