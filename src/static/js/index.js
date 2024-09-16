
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

renderer.setSize(parent.offsetWidth*0.465, parent.offsetWidth*0.465*0.5);
document.getElementById('lidar-container').appendChild(renderer.domElement);

const controls = new THREE.OrbitControls(camera, renderer.domElement);
const loader = new THREE.PCDLoader();

const point_func = function(points) {
  points.geometry.computeBoundingBox();
  points.material = new THREE.ShaderMaterial({
    uniforms: {
      bboxMin: {
        value: points.geometry.boundingBox.min
      },
      bboxMax: {
        value: points.geometry.boundingBox.max
      },
    },
    vertexShader: `
      uniform vec3 bboxMin;
      uniform vec3 bboxMax;
      varying vec3 vUv;
      void main() {
        vUv.z = (position.z - bboxMin.z) / (bboxMax.z - bboxMin.z);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = 1.0;
      }
    `,
    fragmentShader: `
      varying vec3 vUv;
      void main() {
        gl_FragColor = vec4(sqrt(sqrt(vUv.z)), 1.0 - sqrt(vUv.z), 1.0, 1.0);
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
}

loader.load('../static/data/00008467.pcd', point_func);

window.addEventListener('resize', function() {
  const parent = document.getElementById('vizblock');
  camera.aspect = parent.offsetWidth / parent.offsetHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(parent.offsetWidth*0.465, parent.offsetWidth*0.465*0.5);
});
