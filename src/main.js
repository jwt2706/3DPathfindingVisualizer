import { main, reset } from './maze.js';

// default is run onload
window.addEventListener('load', () => {
  main(9, 9, 9, 0.2);
});

document.getElementById('toggleControls').addEventListener('click', function() {
  const controls = document.getElementById('controls');
  if (controls.style.display === 'none') {
    controls.style.display = 'block';
  } else {
    controls.style.display = 'none';
  }
});

document.getElementById('generateButton').addEventListener('click', () => {
  reset(
    document.getElementById('mazeWidth').value,
    document.getElementById('mazeHeight').value,
    document.getElementById('mazeDepth').value,
    document.getElementById('wallIntensity').value
  );
});