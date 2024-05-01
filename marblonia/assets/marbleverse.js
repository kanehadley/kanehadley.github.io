

//let marbleverse = (function () {
//    const canvas = document.querySelector("#world"),
//        gl = canvas.getContext("webgl");
//    
//    
//    const vsSource = `
//        attribute vec4 aVertexPosition;
//        uniform mat4 uModelViewMatrix;
//        uniform mat4 uProjectionMatrix;
//        void main() {
//            gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
//        }
//    `;
//    
//    const fsSource = `
//        void main() {
//            gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
//        }
//    `;
//    
//    
//    function drawScene(gl, programInfo, buffers) {
//        gl.clearColor(0.0, 0.0, 0.0, 1.0);
//        gl.clearDepth(1.0);
//        gl.enable(gl.DEPTH_TEST);
//        gl.depthFunc(gl.LEQUAL);
//        
//        gl.clear(gl.COLOR_BUFFER_BIT || gl.DEPTH_BUFFER_BIT);
//        
//        const fieldOfView = (45 * Math.PI) / 180;
//        const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
//        const zNear = 0.1;
//        const zFar = 100.0;
//        //const projectionMatrix = mat4.create();
//        
//    }
//    
//    
//    function initBuffers(gl) {
//        const positionBuffer = initPositionBuffer(gl);
//        
//        return {
//            position: positionBuffer,
//        };
//    }
//    
//    function initPositionBuffer(gl) {
//        const positionBuffer = gl.createBuffer();
//        
//        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
//        
//        const positions = [1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, -1.0];
//        
//        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
//        
//        return positionBuffer;
//    }
//    
//    function initShaderProgram(gl, vsSource, fsSource) {
//        const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
//        const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);
//        
//        const shaderProgram = gl.createProgram();
//        gl.attachShader(shaderProgram, vertexShader);
//        gl.attachShader(shaderProgram, fragmentShader);
//        gl.linkProgram(shaderProgram);
//        
//        if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
//            alert(
//                `Unable to initialize the shader program: ${gl.getProgramInfoLog(shaderProgram)}`,
//            );
//        }
//        
//        return shaderProgram;
//        
//    }
//    
//    function loadShader(gl, type, source) {
//        const shader = gl.createShader(type);
//        
//        gl.shaderSource(shader, source);
//        
//        gl.compileShader(shader);
//        
//        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
//            alert(
//                `An error occurred compiling the shaders: ${gl.getShaderInfoLog(shader)}`,
//            );
//            gl.deleteShader(shader);
//            return null;
//        }
//        
//        return shader;
//    }
//    
//    function start() {
//        //gl.clearColor(0.0, 0.0, 0.0, 1.0);
//        //gl.clear(gl.COLOR_BUFFER_BIT);
//        
//    
//        const shaderProgram = initShaderProgram(gl, vsSource, fsSource);
//        const programInfo = {
//            program: shaderProgram,
//            attribLocations: {
//                vertexPosition: gl.getAttribLocation(shaderProgram, "aVertexPosition"),
//            },
//            uniformLocations: {
//                projectionMatrix: gl.getUniformLocation(shaderProgram, "uProjectionMatrix"),
//                modelViewMatrix: gl.getUniformLocation(shaderProgram, "uModelViewMatrix")
//            }
//        };
//        const buffers = initBuffers(gl);
//        
//        drawScene(gl, programInfo, buffers);
//    }
//    
//    return {
//        start: start
//    };
//})();

//marbleverse = (function () {
//    function start() {
//        //alert('hello');
//    }
//    
//    return {
//        start: start
//    };
//})();
//
//window.addEventListener("load", marbleverse.start);

//import * as THREE from "/vendor/three/build/three.module.js";
import * as THREE from "three";
//import { OrbitControls } from "/vendor/three/examples/jsm/controls/OrbitControls.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import Stats from "three/examples/jsm/libs/stats.module";


let marbleverse = (function () {

    let basicStart = (function () {
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000 );
        const renderer = new THREE.WebGLRenderer();

        //const geometry = new THREE.BoxGeometry( 1, 1, 1 );
        //const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
        //const cube = new THREE.Mesh( geometry, material );

        //const geometry = new THREE.BoxGeometry( 16, 16, 16 );
        //const material = new THREE.MeshNormalMaterial();
        //const cube = new THREE.Mesh(geometry, material);

        //const geometry = new THREE.BoxGeometry( 16, 16, 16, 16, 16, 15 );
        //const material = new THREE.MeshStandardMaterial({
        //    color: 0xff0000,
        //    wireframe: true,
        //});
        //const cube = new THREE.Mesh(geometry, material);

        const geometry = new THREE.BoxGeometry( 16, 16, 16, 16, 16, 15 );
        const material = new THREE.ShaderMaterial({
            //color: 0xff0000,
            wireframe: true,
            vertexShader: `
            void main() {
                // projectionMatrix, modelViewMatrix, position --> passed in from Three.js

                gl_Position = projectionMatrix
                  * modelViewMatrix
                  * vec4(position.x, position.y, position.z, 1.0);

                //gl_Position = projectionMatrix
                //  * modelViewMatrix
                //  * vec4(position.x, sin(position.z) + position.y, position.z, 1.0);
                  //
                //gl_Position = projectionMatrix
                  //* modelViewMatrix
                  //* vec4(position.x, 4.0 * sin(position.z / 4.0) + position.y, position.z, 1.0);
            }
            `,
            fragmentShader: `
            void main() {
              gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
            }
            `
        });
        const cube = new THREE.Mesh(geometry, material);

        const axesHelper = new THREE.AxesHelper(16);

        const controls = new OrbitControls(camera, renderer.domElement);

        const stats = Stats();
        document.body.appendChild(stats.dom);

        function animate() {
            requestAnimationFrame( animate );
            //cube.rotation.x += 0.01;
            //cube.rotation.y += 0.01;
            stats.update();
            controls.update();
            renderer.render( scene, camera );
        }

        function start() {

            renderer.setSize( window.innerWidth / 2, window.innerHeight / 2 );
            document.body.appendChild( renderer.domElement );
            scene.add( axesHelper );

            scene.add( cube );
            camera.position.z = 25;

            animate();
        }
    
        return start;
        
    })();
    
    let planarStart = (function () {
        const clock = new THREE.Clock();
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000 );
        const renderer = new THREE.WebGLRenderer();

        //const geometry = new THREE.BoxGeometry( 1, 1, 1 );
        //const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
        //const cube = new THREE.Mesh( geometry, material );

        //const geometry = new THREE.BoxGeometry( 16, 16, 16 );
        //const material = new THREE.MeshNormalMaterial();
        //const cube = new THREE.Mesh(geometry, material);

        //const geometry = new THREE.BoxGeometry( 16, 16, 16, 16, 16, 15 );
        //const material = new THREE.MeshStandardMaterial({
        //    color: 0xff0000,
        //    wireframe: true,
        //});
        //const cube = new THREE.Mesh(geometry, material);

        const uniformData = {
            u_time: {
                type: 'f',
                value: clock.getElapsedTime(),
            }
        };
        
        //const geometry = new THREE.BoxGeometry( 16, 16, 16, 16, 16, 15 );
        const geometry = new THREE.PlaneGeometry( 16, 16 );
        const material = new THREE.ShaderMaterial({
            //color: 0xff0000,
            //wireframe: true,
            uniforms: uniformData,
            vertexShader: `
            
            varying vec3 pos;
            uniform float u_time;
            
            void main() {
                // projectionMatrix, modelViewMatrix, position --> passed in from Three.js
                
                
                
                vec4 result;
                pos = position;
                
                //result = vec4(position.x, position.y, position.z, 1.0);
                //result = vec4(position.x, sin(position.z) + position.y, position.z, 1.0);
                //result = vec4(position.x, 4.0 * sin(position.z / 4.0) + position.y, position.z, 1.0);
                result = vec4(position.x, position.y + sin(u_time), position.z, 1.0);

                gl_Position = projectionMatrix
                  * modelViewMatrix
                  * result;
            }
            `,
            fragmentShader: `
            
            varying vec3 pos;
            uniform float u_time;
            
            void main() {
              //gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
              
              //position.x;
              //gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
              //gl_FragColor = vec4(abs(sin(u_time)), 0.0, 0.0, 1.0);
              
              if (pos.x >= 0.0) {
                gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
              } else {
                gl_FragColor = vec4(0.0, 1.0, 0.0, 1.0);
              }
            }
            `
        });
        const plane = new THREE.Mesh(geometry, material);

        const axesHelper = new THREE.AxesHelper(16);

        const controls = new OrbitControls(camera, renderer.domElement);

        const stats = Stats();
        document.body.appendChild(stats.dom);

        
        
        function animate() {
            uniformData.u_time.value = clock.getElapsedTime();
            requestAnimationFrame( animate );
            //cube.rotation.x += 0.01;
            //cube.rotation.y += 0.01;
            stats.update();
            controls.update();
            renderer.render( scene, camera );
        }

        function start() {

            renderer.setSize( window.innerWidth / 2, window.innerHeight / 2 );
            document.body.appendChild( renderer.domElement );
            scene.add( axesHelper );

            scene.add( plane );
            camera.position.z = 25;

            animate();
        }
    
        return start;
        
    })();

    return {
        //start: start
        //start: basicStart
        start: planarStart
    };
})();

window.addEventListener("load", marbleverse.start);

