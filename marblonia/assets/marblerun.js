
marblerun = (function(){
    
    const canvas = document.getElementById('marblefield');
    const ctx = canvas.getContext("2d");
    
    const width = 400;
    const height = 300;
    
    let currentTime = Date.now(),
        previousTime = currentTime,
        drone = {
            kind: 'drone',
            x: width * Math.random(),
            y: height * Math.random(),
            v: 10, // Pixels per second
            state: 'chase',
            energy: 100,
            burn: -5,
        },
        drones = [],
        bait = {
            kind: 'bait',
            x: 100,
            y: 100,
        },
        obstacles = [];
    const drone_size = 10;
    const drone_color = 'rgb(0 0 200 / 50%)';

    const bait_size = 10;
    const bait_color = 'rgb(200 0 0)';
    
    function shout(){
        console.log("hello");
    }
    
    function coordx(x) {return x;}
    function coordy(y) {return height - y;}
    
    function cycle() {
        previousTime = currentTime;
        currentTime = Date.now();
        let dt = currentTime - previousTime;
        
        drones = drones.map(function(drone) {
            
            dest = move_entity(drone.x, drone.y, bait.x, bait.y, drone.v, dt);
            return {
                ...drone,
                x: dest[0],
                y: dest[1],
            };
        });
        
        if ('chase' === drone.state) {
            if (((bait.x - drone.x)**2 + (bait.y - drone.y)**2) > (drone.v * drone.v/2)) {
                dest = move_entity(drone.x, drone.y, bait.x, bait.y, drone.v, dt);    
            }
            

            drone = {
                ...drone,
                x: dest[0],
                y: dest[1],
                energy: drone.energy + (dt * drone.burn),
            };
        }
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
    
    function drawGuidelines() {
        ctx.beginPath();
        ctx.moveTo(width/2, 0);
        ctx.lineTo(width/2, height);
        ctx.moveTo(0, height/2);
        ctx.lineTo(width, height/2);
        ctx.stroke();
    }
    
    function mouseclick(e) {
        bait = {
            ...bait,
            x: coordx(e.offsetX),
            y: coordy(e.offsetY)
        };
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
            v: 10, // Pixels per second
            state: 'chase',
            energy: 100,
            burn: -5,
        });
    } 
    
    function start() {
        canvas.setAttribute('width', width);
        canvas.setAttribute('height', height);
        
        canvas.addEventListener('click', mouseclick);
        
        document.getElementById('toggle-chase').onclick = toggleChase;
        document.getElementById('spawn-drone').onclick = spawnDrone;
        
        previousTime = Date.now();
        
        //spawnDrone();
        
        setInterval(cycle, 100);
    }
    
    
    function toggleChase() {
        drone = {
            ...drone,
            state: 'chase' === drone.state ? 'idle' : 'chase'
        };
    }
    
    return {
        start: start
    };
}());
    
    
window.addEventListener("load", marblerun.start);

