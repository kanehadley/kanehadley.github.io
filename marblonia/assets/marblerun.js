marblerun = (function () {
    const canvas = document.getElementById("marblefield");
    const ctx = canvas.getContext("2d");

    const width = 400;
    const height = 300;

    const drone_size = 10;
    const drone_color = "rgb(0 0 200 / 50%)";

    const bait_size = 10;
    const bait_color = "rgb(200 0 0)";

    
    let moduleInitializationTime = Date.now();
        //currentTime = moduleInitializationTime,
        //previousTime = moduleInitializationTime,
        //drones = [],
        //bait = {
        //    kind: "bait",
        //    x: 100,
        //    y: 100,
        //    stateStart: currentTime
        //},
        //obstacles = [],
        //manualBaitControl = false,
        //showIntents = false,
        //telepathyFocus;

    let environment = {
        currentTime: moduleInitializationTime,
        previousTime: moduleInitializationTime,
        drones: [],
        bait: {
            kind: "bait",
            x: 100,
            y: 100,
            stateStart: moduleInitializationTime
        },
        obstacles: [],
        manualBaitControl: false,
        showIntents: false,
        telepathyFocus: undefined
    };

    function pixelsToCoords([x, y]) {
        /* Converts pixel domain to coordinate domain.
         *
         */
        return [x, height - y];
    }

    function coordsToPixels([x, y]) {
        /* Converts coordinate domain to pixel domain.
         *
         */
        return [x, height - y];
    }

    function tickEnvironment(environment) {
        let currentTime = Date.now(),
            dt = currentTime - environment.previousTime;

        let drones = environment.drones.map(function (drone, index) {
            let energy = drone.energy + dt * drone.burn,
                [x, y] = move_entity(
                    drone.x,
                    drone.y,
                    drone.targetX,
                    drone.targetY,
                    drone.v,
                    dt
                ),
                newPosition = {
                    x: x,
                    y: y
                },
                newTarget = {};

            if ("chase" === drone.state) {
                newTarget = {
                    targetX: environment.bait.x,
                    targetY: environment.bait.y
                };
            } else if ("scurry" === drone.state) {
                let timeCheck = Date.now();
                if (timeCheck - drone.stateStart > 3000) {
                    newTarget = {
                        targetX: width * Math.random(),
                        targetY: height * Math.random(),
                        stateStart: timeCheck
                    };
                }
            } else if ("equilibrate" === drone.state) {
                let minimumDistance = 50;

                let vectors = environment
                    .drones
                    .filter((subdrone, subindex) => subindex != index)
                    .filter(
                        (subdrone) =>
                            Math.sqrt(
                                (drone.x - subdrone.x) ** 2 +
                                    (drone.y - subdrone.y) ** 2
                            ) < minimumDistance
                    )
                    .map((subdrone) => ({
                        targetX:
                            drone.x + (drone.x - subdrone.x) + Math.random(),
                        targetY:
                            drone.y + (drone.y - subdrone.y) + Math.random()
                    }));

                if (vectors.length === 0) {
                    let xCentroid = environment
                        .drones
                            .map((subdrone) => subdrone.x)
                            .reduce((a, b) => a + b) / environment.drones.length;
                    let yCentroid = environment
                        .drones
                            .map((subdrone) => subdrone.y)
                            .reduce((a, b) => a + b) / environment.drones.length;
                    newTarget = {
                        targetX: xCentroid,
                        targetY: yCentroid
                    };
                } else {
                    newTarget = vectors[0];
                }
            }

            
            newDrone = {
                ...drone,
                ...newPosition,
                ...newTarget,
                energy: energy
            };

            return newDrone;
        });

        return {
            ...environment,
            previousTime: environment.currentTime,
            currentTime: currentTime,
            drones: drones
        };
    }

    function cycle() {
        
        environment = tickEnvironment(environment);
        
    
        //previousTime = currentTime;
        //currentTime = Date.now();
        //let dt = currentTime - previousTime;

        //drones = drones.map(function (drone, index) {
        //    let energy = drone.energy + dt * drone.burn,
        //        [x, y] = move_entity(
        //            drone.x,
        //            drone.y,
        //            drone.targetX,
        //            drone.targetY,
        //            drone.v,
        //            dt
        //        ),
        //        newPosition = {
        //            x: x,
        //            y: y
        //        },
        //        newTarget = {};
//
        //    if ("chase" === drone.state) {
        //        newTarget = {
        //            targetX: bait.x,
        //            targetY: bait.y
        //        };
        //    } else if ("scurry" === drone.state) {
        //        let timeCheck = Date.now();
        //        if (timeCheck - drone.stateStart > 3000) {
        //            newTarget = {
        //                targetX: width * Math.random(),
        //                targetY: height * Math.random(),
        //                stateStart: timeCheck
        //            };
        //        }
        //    } else if ("equilibrate" === drone.state) {
        //        let minimumDistance = 50;
//
        //        let vectors = drones
        //            .filter((subdrone, subindex) => subindex != index)
        //            .filter(
        //                (subdrone) =>
        //                    Math.sqrt(
        //                        (drone.x - subdrone.x) ** 2 +
        //                            (drone.y - subdrone.y) ** 2
        //                    ) < minimumDistance
        //            )
        //            .map((subdrone) => ({
        //                targetX:
        //                    drone.x + (drone.x - subdrone.x) + Math.random(),
        //                targetY:
        //                    drone.y + (drone.y - subdrone.y) + Math.random()
        //            }));
//
        //        if (vectors.length === 0) {
        //            let xCentroid =
        //                drones
        //                    .map((subdrone) => subdrone.x)
        //                    .reduce((a, b) => a + b) / drones.length;
        //            let yCentroid =
        //                drones
        //                    .map((subdrone) => subdrone.y)
        //                    .reduce((a, b) => a + b) / drones.length;
        //            newTarget = {
        //                targetX: xCentroid,
        //                targetY: yCentroid
        //            };
        //        } else {
        //            newTarget = vectors[0];
        //        }
        //    }
//
        //    newDrone = {
        //        ...drone,
        //        ...newPosition,
        //        ...newTarget,
        //        energy: energy
        //    };
//
        //    return newDrone;
        //});

        draw();
    }

    function drawEnvironment(environment) {
        drawBait(environment.bait.x, environment.bait.y, bait_size);

        environment.drones.forEach((drone) =>
            drawDrone(drone.x, drone.y, drone_size)
        );
        
        if (environment.showIntents) {environment.drones.forEach(drawIntent);}
        
        drawTelepathy();
        
        //drawGuidelines();
    }

    function draw() {
        ctx.clearRect(0, 0, width, height);

        drawEnvironment(environment);

        //
        //ctx.fillStyle = 'rgb(0 0 200 / 50%)';
        //ctx.fillRect(30, 30, 50, 50);
        //
        //ctx.fillStyle = 'rgb(0 0 200 / 50%)';
        //ctx.fillRect(30, 30, 50, 50);

        //drawBait(bait.x, bait.y, bait_size);
        ////drawDrone(drone.x, drone.y, drone_size);
        //drones.forEach((drone) => drawDrone(drone.x, drone.y, drone_size));
        //
        //if (showIntents) {drones.forEach(drawIntent);}
        //
        //drawTelepathy();
        ////drawGuidelines();
    }

    function drawBait(x, y, size) {
        let [pX, pY] = coordsToPixels([x - size / 2, y + size / 2]);
        ctx.fillStyle = bait_color;
        ctx.fillRect(pX, pY, size, size);
    }

    function drawDrone(x, y, size) {
        let [pX, pY] = coordsToPixels([x, y]);
        ctx.fillStyle = "rgb(0 0 200 / 50%)";
        ctx.beginPath();
        ctx.arc(pX, pY, size, 0, 360);
        ctx.fill();
        //ctx.closePath();
    }

    function drawIntent(drone) {
        let [pX, pY] = coordsToPixels([drone.x, drone.y]);
        let [tX, tY] = coordsToPixels([drone.targetX, drone.targetY]);

        ctx.fillStyle = "rgb(0 0 0)";
        ctx.beginPath();
        ctx.moveTo(pX, pY);
        ctx.lineTo(tX, tY);
        ctx.stroke();
    }

    function drawTelepathy() {
        if (undefined !== environment.telepathyFocus) {
            let drone = environment.drones[environment.telepathyFocus];

            let elem = document.getElementById("telepathy");
            elem.innerHTML =
                "Index: " +
                (environment.telepathyFocus + 1) +
                "<BR>" +
                "X: " +
                drone.x +
                "<BR>" +
                "Y: " +
                drone.y +
                "<BR>" +
                "DestinationX: " +
                drone.targetX +
                "<BR>" +
                "DestinationY: " +
                drone.targetY +
                "<BR>" +
                "Velocity: " +
                drone.v +
                "<BR>" +
                "State: " +
                drone.state +
                "<BR>" +
                "Energy: " +
                drone.energy +
                "<BR>" +
                "Burn: " +
                drone.burn +
                "<BR>";
        } else {
            let elem = document.getElementById("telepathy");
            elem.innerHTML = "";
        }
    }

    function drawGuidelines() {
        ctx.beginPath();
        ctx.moveTo(width / 2, 0);
        ctx.lineTo(width / 2, height);
        ctx.moveTo(0, height / 2);
        ctx.lineTo(width, height / 2);
        ctx.stroke();
    }

    function mouseclick(e) {
        if (environment.manualBaitControl) {
            let [x, y] = pixelsToCoords([e.offsetX, e.offsetY]);

            //bait = { ...bait, x: x, y: y };
            
            environment = {
                ...environment,
                bait: {
                    ...environment.bait,
                    x: x,
                    y: y
                },
            };
        } else {
            environment = {
                ...environment,
                telepathyFocus: undefined,
            };
            
            environment.drones.forEach(function (drone, index) {
                let [pX, pY] = coordsToPixels([drone.x, drone.y]);
                if (
                    Math.sqrt((e.offsetX - pX) ** 2 + (e.offsetY - pY) ** 2) <
                    drone_size
                ) {
                    environment = {
                        ...environment,
                        telepathyFocus: index,
                    };
                }
            });
        }
    }

    function move_entity(srcx, srcy, destx, desty, v, t) {
        ux = destx - srcx;
        uy = desty - srcy;

        d = Math.sqrt(ux * ux + uy * uy);

        tx = (t * v * ux) / (1000 * d);
        ty = (t * v * uy) / (1000 * d);

        return [srcx + tx, srcy + ty];
    }

    function generateDrone() {
        return {
            x: width * Math.random(),
            y: height * Math.random(),
            targetX: width * Math.random(),
            targetY: height * Math.random(),
            v: 10, // Pixels per second
            state: "chase",
            energy: 100,
            burn: -5,
            stateStart: Date.now()
        };
    }

    function spawnDrone() {
        //environment = {
        //    ...environment,
        //    drones: environment.drones.push(generateDrone())
        //};
        //
        environment.drones.push(generateDrone());
    }

    function initializeDevelopment() {
        environment = {
            ...environment,
            drones: [generateDrone(), generateDrone(), generateDrone()]
        };

        mouseclick({offsetX: environment.bait.x, offsetY: environment.bait.y});
    }

    function start() {
        canvas.setAttribute("width", width);
        canvas.setAttribute("height", height);

        canvas.addEventListener("click", mouseclick);

        document.getElementById("toggle-show-intents").onclick =
            toggleShowIntents;
        document.getElementById("toggle-bait-control").onclick =
            toggleBaitControl;
        document.getElementById("spawn-drone").onclick = spawnDrone;

        document.getElementById("chase-behavior").onclick = activateChase;
        document.getElementById("scurry-behavior").onclick = activateScurry;
        document.getElementById("equilibrate-behavior").onclick =
            activateEquilibrate;

        previousTime = Date.now();

        

        //spawnDrone();

        initializeDevelopment();

        setInterval(cycle, 100);
    }

    function activateChase() {
        let stateStart = Date.now();
        environment = {
            ...environment,
            drones: environment.drones.map((drone) => ({
                ...drone,
                state: "chase",
                stateStart: stateStart,
            }))
        };
    }

    function activateScurry() {
        let stateStart = Date.now();
        environment = {
            ...environment,
            drones: environment.drones.map((drone) => ({
                ...drone,
                state: "scurry",
                stateStart: stateStart,
            }))
        };
    }

    function activateEquilibrate() {
        let stateStart = Date.now();
        environment = {
            ...environment,
            drones: environment.drones.map((drone) => ({
                ...drone,
                state: "equilibrate",
                stateStart: stateStart,
            }))
        };
    }

    function toggleBaitControl() {
        environment = {
            ...environment,
            manualBaitControl: !(environment.manualBaitControl)
        };
    }

    function toggleShowIntents() {
        environment = {
            ...environment,
            showIntents: !environment.showIntents
        };
    }

    return {
        start: start
    };
})();

window.addEventListener("load", marblerun.start);
