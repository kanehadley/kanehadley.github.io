
marblerun = (function(){
    
    const canvas = document.getElementById('marblefield');
    const ctx = canvas.getContext("2d");
    
    const width = 400;
    const height = 300;
    
    let currentTime = Date.now(),
        previousTime = currentTime,
        drones = [],
        bait = {
            kind: 'bait',
            x: 100,
            y: 100,
            stateStart: currentTime,
        },
        obstacles = [],
        manualBaitControl = false,
        showIntents = false,
        telepathyFocus;
    const drone_size = 10;
    const drone_color = 'rgb(0 0 200 / 50%)';

    const bait_size = 10;
    const bait_color = 'rgb(200 0 0)';
    
    function shout() {
        console.log("hello");
    }
    
    function coordx(x) {return x;}
    function coordy(y) {return height - y;}
    
    function cycle() {
        previousTime = currentTime;
        currentTime = Date.now();
        let dt = currentTime - previousTime;
        
        drones = drones.map(function(drone, index) {
            let energy = drone.energy + (dt * drone.burn),
                //dest = (
                //    'chase' === drone.state ?
                //    move_entity(drone.x, drone.y, drone.targetX, drone.targetY, drone.v, dt)
                //    : [drone.x, drone.y]
                //),
                dest = move_entity(
                    drone.x,
                    drone.y,
                    drone.targetX,
                    drone.targetY,
                    drone.v,
                    dt
                ),
                newPosition = {
                    x: dest[0],
                    y: dest[1],
                },
                newTarget = {};
            
            if ('chase' === drone.state) {
                newTarget = {
                    targetX: bait.x,
                    targetY: bait.y,
                };
            } else if ('scurry' === drone.state) {
                let timeCheck = Date.now();
                if (timeCheck - drone.stateStart > 3000) {
                    newTarget = {
                        targetX: width * Math.random(),
                        targetY: height * Math.random(),
                        stateStart: timeCheck,
                    };
                }
            } else if ('equilibrate' === drone.state) {
                let minimumDistance = 50;
                
                let vectors = (
                    drones
                    .filter((subdrone, subindex) => subindex != index)
                    .filter((subdrone) => Math.sqrt((drone.x - subdrone.x)**2 + (drone.y - subdrone.y)**2) < minimumDistance)
                    .map((subdrone) => ({
                        targetX: drone.x + (drone.x - subdrone.x) + Math.random(),
                        targetY: drone.y + (drone.y - subdrone.y) + Math.random(),
                    }))
                );
                
                if (vectors.length === 0) {
                    let xCentroid = drones.map((subdrone) => subdrone.x).reduce((a,b)=>a+b)/drones.length;
                    let yCentroid = drones.map((subdrone) => subdrone.y).reduce((a,b)=>a+b)/drones.length;
                    newTarget = {
                        targetX: xCentroid,
                        targetY: yCentroid,
                    };
                } else {
                    newTarget = vectors[0];
                }
            }
            
            newDrone = {
                ...drone,
                ...newPosition,
                ...newTarget,
                energy: energy,
            };
            
            return newDrone;
        });

        draw();
    }
    
    function draw() {
        ctx.clearRect(0, 0, width, height);
        
        
        //
        //ctx.fillStyle = 'rgb(0 0 200 / 50%)';
        //ctx.fillRect(30, 30, 50, 50);
        //
        //ctx.fillStyle = 'rgb(0 0 200 / 50%)';
        //ctx.fillRect(30, 30, 50, 50);
        
        drawBait(bait.x, bait.y, bait_size);
        //drawDrone(drone.x, drone.y, drone_size);
        drones.forEach((drone) => drawDrone(drone.x, drone.y, drone_size));
        
        if (showIntents) {drones.forEach(drawIntent);}
        
        drawTelepathy();
        //drawGuidelines();
        
    }
    
    function drawBait(x, y, size) {
        ctx.fillStyle = bait_color;
        ctx.fillRect(projectx(x - (size / 2)), projecty(y + (size / 2)), size, size);
        
    }
    
    function drawDrone(x, y, size) {
        ctx.fillStyle = 'rgb(0 0 200 / 50%)';
        ctx.beginPath();
        ctx.arc(projectx(x), projecty(y), size, 0, 360);
        ctx.fill();
        //ctx.closePath();
    }
    
    function drawIntent(drone) {
        ctx.fillStyle = 'rgb(0 0 0)';
        ctx.beginPath();
        ctx.moveTo(projectx(drone.x), projecty(drone.y));
        ctx.lineTo(projectx(drone.targetX), projecty(drone.targetY));
        ctx.stroke();
    }
    
    function drawTelepathy() {
        if (undefined !== telepathyFocus) {
            let drone = drones[telepathyFocus];
            
            //ctx.fillStyle = 'rgb(0 0 0)';
            //ctx.beginPath();
            //ctx.moveTo(projectx(drone.x), projecty(drone.y));
            //ctx.lineTo(projectx(drone.targetX), projecty(drone.targetY));
            //ctx.stroke();
            
            let elem = document.getElementById("telepathy");
            elem.innerHTML = (
                "Index: " + (telepathyFocus + 1) + "<BR>" +
                "X: " + drone.x + "<BR>" +
                "Y: " + drone.y + "<BR>" +
                "DestinationX: " + drone.targetX + "<BR>" +
                "DestinationY: " + drone.targetY + "<BR>" +
                "Velocity: " + drone.v + "<BR>" +
                "State: " + drone.state + "<BR>" +
                "Energy: " + drone.energy + "<BR>" +
                "Burn: " + drone.burn + "<BR>"
            );
        } else {
            let elem = document.getElementById("telepathy");
            elem.innerHTML = "";
        }
        
    }
    
    function drawGuidelines() {
        ctx.beginPath();
        ctx.moveTo(width/2, 0);
        ctx.lineTo(width/2, height);
        ctx.moveTo(0, height/2);
        ctx.lineTo(width, height/2);
        ctx.stroke();
    }
    
    function mouseclick(e) {
        if (manualBaitControl) {
            
        
            bait = {
                ...bait,
                x: coordx(e.offsetX),
                y: coordy(e.offsetY)
            };

            //drones = drones.map(function(drone) {
            //    let x = (
            //        'chase' === drone.state ?
            //        bait.x
            //        : drone.x
            //        ),
            //        y = (
            //        'chase' === drone.state ?
            //        bait.y
            //        : drone.y
            //        );
//
            //    return {
            //        ...drone,
            //        targetX: x,
            //        targetY: y,
            //    }; 
            //});
        } else {
            telepathyFocus = undefined;
            drones.forEach(function (drone, index) {
                if (Math.sqrt((e.offsetX - projectx(drone.x))**2 + (e.offsetY - projecty(drone.y))**2) < drone_size) {
                    telepathyFocus = index;
                }
            });
        }
        
    }
    
    function move_entity(srcx, srcy, destx, desty, v, t) {
        ux = destx - srcx;
        uy = desty - srcy;

        d = Math.sqrt(ux*ux + uy*uy);

        tx = t * v * ux / (1000 * d);
        ty = t * v * uy / (1000 * d);


        return [srcx + tx, srcy + ty];
    }
    
    function projectx(x) {return x;}
    function projecty(y) {return height - y;}
    
    function spawnDrone() {
        drones.push({
            x: width * Math.random(),
            y: height * Math.random(),
            targetX: width * Math.random(),
            targetY: height * Math.random(),
            v: 10, // Pixels per second
            state: 'chase',
            energy: 100,
            burn: -5,
            stateStart: Date.now(),
        });
    } 
    
    function initializeDevelopment() {
        spawnDrone();
        spawnDrone();
        spawnDrone();
        
        mouseclick({offsetX: bait.x, offsetY: bait.y});
    }
    
    function start() {
        canvas.setAttribute('width', width);
        canvas.setAttribute('height', height);
        
        canvas.addEventListener('click', mouseclick);
        
        document.getElementById('toggle-show-intents').onclick = toggleShowIntents;
        document.getElementById('toggle-bait-control').onclick = toggleBaitControl;
        document.getElementById('spawn-drone').onclick = spawnDrone;
        
        document.getElementById('chase-behavior').onclick = activateChase;
        document.getElementById('scurry-behavior').onclick = activateScurry;
        document.getElementById('equilibrate-behavior').onclick = activateEquilibrate;
        
        previousTime = Date.now();
        
        //spawnDrone();
        
        initializeDevelopment();
        
        setInterval(cycle, 100);
    }
    
    
    function activateChase() {
        drones = drones.map((drone) => ({...drone, state: 'chase', stateStart: Date.now()}));
    }
    
    function activateScurry() {
        drones = drones.map((drone) => ({...drone, state: 'scurry', stateStart: Date.now()}));
    }
    
    function activateEquilibrate() {
        drones = drones.map((drone) => ({...drone, state: 'equilibrate', stateStart: Date.now()}));
    }
    
    function toggleChase() {
        drone = {
            ...drone,
            state: 'chase' === drone.state ? 'idle' : 'chase'
        };
    }
    
    function toggleBaitControl() {manualBaitControl = !manualBaitControl;}
    
    function toggleShowIntents() {showIntents = !showIntents;}
    
    return {
        start: start
    };
}());
    
    
window.addEventListener("load", marblerun.start);

