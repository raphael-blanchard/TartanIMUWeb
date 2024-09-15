
// Initialize the Camera viewer
bulmaCarousel.attach('#camera-carousel', {
  slidesToScroll: 1,
  slidesToShow: 1,
  infinite: true,
});

// Initialize the Lidar viewer
const scene = new THREE.Scene();
const parent = document.getElementById('vizblock');
const camera = new THREE.PerspectiveCamera(75, 1 / 0.5, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();

renderer.setSize(parent.offsetWidth*0.6, parent.offsetWidth*0.3);
document.getElementById('lidar-container').appendChild(renderer.domElement);

const controls = new THREE.OrbitControls(camera, renderer.domElement);
const loader = new THREE.PCDLoader();

loader.load('../static/data/00008467.pcd', function(points) {
  points.material = new THREE.ShaderMaterial({
    uniforms: {
      bboxMin: {
        value: points.geometryboundingBox.min
      },
      bboxMax: {
        value: points.geometry.boundingBox.max
      }
    },
    vertexShader: `
      void main() {
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = 1.0;
        vColor = color;
      }
    `,
  });


  scene.add(points);
  camera.position.set(0, -30, 30);
  controls.update();

  function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  }
  animate();
});

window.addEventListener('resize', function() {
  const parent = document.getElementById('vizblock');
  camera.aspect = parent.offsetWidth / parent.offsetHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(parent.offsetWidth*0.6, parent.offsetWidth*0.3);
});
