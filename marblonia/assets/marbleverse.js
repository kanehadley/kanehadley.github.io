import * as THREE from "three";
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

        const uniformData = {
            u_time: {
                type: 'f',
                value: clock.getElapsedTime(),
            }
        };
        
        function generateVertexShader() {
            let source = `
            
            varying vec3 pos;
            uniform float u_time;
            
            void main() {
                // projectionMatrix, modelViewMatrix, position --> passed in from Three.js
                
                
                
                vec4 result;
                pos = position;
                
                result = vec4(position.x, position.y, position.z, 1.0);
                //result = vec4(position.x, sin(position.z) + position.y, position.z, 1.0);
                //result = vec4(position.x, 4.0 * sin(position.z / 4.0) + position.y, position.z, 1.0);
                //result = vec4(position.x, position.y + sin(u_time), position.z, 1.0);

                gl_Position = projectionMatrix
                  * modelViewMatrix
                  * result;
            }
            `;
            
            return source;
        }
        
        function generateFragmentShader() {
            
            function generateBasicShader() {
                let source = `
            
                varying vec3 pos;
                uniform float u_time;

                void main() {
                  float d;
                  vec2 uv = pos.xy;
                  vec3 color = vec3(0);

                  d = length(uv) - 0.5;

                  if (d < 0.0) {
                    color = vec3(1);
                  }

                  gl_FragColor = vec4(color, 1.0);
                }
                `;
                
                return source;
            }
            
            function generateConcentricShader() {
                let source = `
            
                varying vec3 pos;
                
                uniform float u_time;

                void main() {
                  //gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);

                  //position.x;
                  //gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
                  //gl_FragColor = vec4(abs(sin(u_time)), 0.0, 0.0, 1.0);

                  //if (pos.x >= 0.0) {
                  //  gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
                  //} else {
                  //  gl_FragColor = vec4(0.0, 1.0, 0.0, 1.0);
                  //}

                  float d;

                  vec2 uv = pos.xy;

                  d = length(uv) - 0.5;

                  vec3 color = vec3(0);


                  float md = mod(d, 0.1);


                  if (abs(md) < 0.01) {
                    if (d < 0.0)
                    {
                        color = vec3(1.0, 0.0, 0.0);
                    }
                    else
                    {
                        color = vec3(0.0, 1.0, 0.0);
                    }
                  }

                  if (abs(d) < 0.03) {
                    color = vec3(1);
                  }

                  gl_FragColor = vec4(color, 1.0);
                }
                `;
                
                return source;
            }
            
            
            function generateMultiShader() {
                let source = `
            
                varying vec3 pos;
                
                uniform float u_time;

                float or(float d1, float d2) {
                    return min(d1, d2);
                }
                
                float and(float d1, float d2) {
                    return max(d1, d2);
                }
                
                float exclude(float d1, float d2) {
                    return and(d1, -d2);
                }
                
                vec2 translate(vec2 uv, vec2 offset) {
                    return uv - offset;
                }
                
                float dCircle(vec2 position, float radius)
                {
                    return length(position) - radius;
                }
                
                float dRoundBox(vec2 position, float radius)
                {
                    float d8 = dot(position, position);
                    return pow(d8, 1.0 / 8.0);
                }

                void main() {
                  vec2 uv = pos.xy;
                  
                  float radius = 0.5;
                  //vec2 offset1 = vec2(0.1*sin(u_time), 0.1*cos(u_time));
                  vec2 offset1 = vec2(sin(u_time), cos(u_time));
                  vec2 offset2 = vec2(-0.1*sin(u_time), 0.1*cos(u_time));
                  float d1 = dCircle(translate(uv, offset1), radius);
                  float d2 = dCircle(translate(uv, offset2), radius);
                  
                  float d = or(d1, d2);
                  //float d = and(d1, d2);
                  //float d = exclude(d1, d2);

                  float md = mod(d, 0.1);
                  float nd = abs(d / 0.1);
                  
                  vec3 color = vec3(0);

                  if (abs(md) < 0.01)
                  {

                    if (d < 0.0)
                    {
                        color = vec3(1.0, 0.0, 0.0) / nd;
                    }
                    else
                    {
                        color = vec3(0.0, 1.0, 0.0) / nd;
                    }
                  }

                  if (abs(d) < 0.03)
                  {
                    color = vec3(1);
                  }

                  gl_FragColor = vec4(color, 1.0);
                }
                `;
                
                return source;
            }
            
            //let source = generateBasicShader();
            //let source = generateConcentricShader();
            let source = generateMultiShader();
            
            return source;
        }
        
        //const geometry = new THREE.BoxGeometry( 16, 16, 16, 16, 16, 15 );
        const geometry = new THREE.PlaneGeometry( 2, 2 );
        const material = new THREE.ShaderMaterial({
            //color: 0xff0000,
            //wireframe: true,
            uniforms: uniformData,
            vertexShader: generateVertexShader(),
            fragmentShader: generateFragmentShader(),
        });
        const plane = new THREE.Mesh(geometry, material);

        const axesHelper = new THREE.AxesHelper(1);

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
            //camera.position.z = 25;
            camera.position.z = 2;

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

