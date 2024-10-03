import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// this priority queue manages which nodes still need to be visited, but in order from closest to furthest
class MinPriorityQueue {
    constructor() {
        this.nodes = []
    }

    enqueue(node, priority) {
        this.nodes.push({ node, priority });
        this.nodes.sort((a, b) => a.priority - b.priority);
    }

    dequeue() {
        return this.nodes.shift();
    }

    isEmpty() {
        return this.nodes.length === 0;
    }

    updatePriority(node, priority) {
        const index = this.nodes.findIndex(n => n.node === node);
        if (index !== -1) {
            this.nodes[index].priority = priority;
            this.nodes.sort((a, b) => a.priority - b.priority);
        }
    }
}

// init threejs stuff
const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer();

export function main(mazeWidth, mazeHeight, mazeDepth, wallIntensity) {
    function generateRandomMaze() {
        const maze = [];
    
        for (let z = 0; z < mazeDepth; z++) {
            const level = [];
            for (let y = 0; y < mazeHeight; y++) {
                const row = [];
                for (let x = 0; x < mazeWidth; x++) {
                    // randomly decide if this cell is a wall or not
                    row.push(Math.random() < wallIntensity ? '#' : ' ');
    
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

    async function dijkstra(startX, startY, startZ, endX, endY, endZ) {
        const distances = {}
        const previous = {}
        const queue = new MinPriorityQueue();

        // init distances for each node and queue
        for (let z = 0; z < mazeDepth; z++) {
            for (let y = 0; y < mazeHeight; y++) {
                for (let x = 0; x < mazeWidth; x++) {
                    distances[x + ',' + y + ',' + z] = Infinity;
                    previous[x + ',' + y + ',' + z] = null;
                    queue.enqueue(x + ',' + y + ',' + z, Infinity);
                }
            }
        }
        
        distances[startX + ',' + startY + ',' + startZ] = 0;
        queue.updatePriority(startX + ',' + startY + ',' + startZ, 0);
        
        while(!queue.isEmpty()) {
            const current = queue.dequeue().node;
            const [currentX, currentY, currentZ] = current.split(',').map(Number);

            // check if we reached the end
            if (currentX == endX && currentY === endY && currentZ === endZ) {
                break;
            }

            // check the neighbords
            const directions = [
                [-1, 0, 0], // left
                [1, 0, 0],    // right
                [0, -1, 0], // down
                [0, 1, 0],    // up
                [0, 0, -1], // backward
                [0, 0, 1]     // forward
            ];

            for (const [dx, dy, dz] of directions) {
                const neighborX = currentX + dx;
                const neighborY = currentY + dy;
                const neighborZ = currentZ + dz;
                
                // check if the neighbor is inbound, and that its not a wall
                if (
                    neighborX >= 0 && neighborX < mazeWidth &&
                    neighborY >= 0 && neighborY < mazeHeight &&
                    neighborZ >= 0 && neighborZ < mazeDepth &&
                    maze[neighborZ][neighborY][neighborX] !== '#'
                ) {
                    const neighborKey = neighborX + "," + neighborY + "," + neighborZ;
                    const newDistance = distances[current] + 1; // since each node is going to have to same weight

                    // only update if the new distance is smaller
                    if (newDistance < distances[neighborKey]) {
                        distances[neighborKey] = newDistance;
                        previous[neighborKey] = current;
                        queue.updatePriority(neighborKey, newDistance);
                    }
                }
            }
        }

        // rebuild the path
        const path = [];
        let current = endX + "," + endY + "," + endZ;
        while(current !== null) {
            path.push(current.split(",").map(Number));
            current = previous[current];
        }

        // render the path
        for (const [x, y, z] of path.reverse()) {
            const pathCube = new THREE.Mesh(pathGeometry, pathMaterial);
            pathCube.position.set(x - halfWidth, y - halfHeight, z - halfDepth);
            scene.add(pathCube);
            await new Promise(resolve => setTimeout(resolve, 50)) // small delay so that you can see whats happeneing
        }

        notify()
    }

    function notify() {
        const notification = document.getElementById('notification');
        notification.classList.add('show');
        setTimeout(function() {
            notification.classList.remove('show');
        }, 5000);
    }

    function animate() {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
    }

    // *** main script below ***

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const controls = new OrbitControls(camera, renderer.domElement);
    const pathMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff });
    const pathGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5); // smaller cube for the path
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

    dijkstra(startX, startY, startZ, endX, endY, endZ);
}

export function reset(width, height, depth, intensity) {
    // Clear the previous maze
    const oldCanvas = document.querySelector('canvas');
    if (oldCanvas) {
        document.body.removeChild(oldCanvas);
    }
    document.body.appendChild(renderer.domElement);
    while(scene.children.length > 0){ 
        scene.remove(scene.children[0]); 
    }
    main(width, height, depth, intensity);
}