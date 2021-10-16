import * as THREE from './three.module.js';

let GAME_STATE = "IDLE";
let MAX_TIME = 5;
let START_TIME = null;
let HIGH_SCORE = 0;

function animate () {
    let THIS_ACTIVE = true;
    let CLICKABLE_OBJ = [];
    let SPHERE_RADIUS = 5;
    let MAX_TARGET = 3;
    let score = 0;

    let light_objects = {
        DirectionalLight: {
            active: true,
            members: []
        },
        HemisphereLight: {
            active: false,
            members: []
        },
        AmbientLight: {
            active: false,
            members: []
        },
        PointLight: {
            active: false,
            members: []
        },
        Spotlights: {
            active: false,
            members: []
        }
    };

    function getRndInteger(min, max) {
        return Math.floor(Math.random() * (max - min)) + min;
    }

    function generateRandomColor() {
        var letters = '0123456789ABCDEF';
        var color = '0x';
        for (var i = 0; i < 6; i++) {
          color += letters[Math.floor(Math.random() * 16)];
        }
        return parseInt(color, 16);
    }

    const fontloader = new THREE.FontLoader();

    // Setup the camera
    const fov = 90;
    const aspect = window.innerWidth / window.innerHeight;  // the canvas default
    const near = 0.1;
    const far = 1000;
    const camera = new THREE.PerspectiveCamera( fov, aspect , near, far );
    camera.position.set(0, 0, 50);

    let canvas = document.querySelector('#canvas');
    const renderer = new THREE.WebGLRenderer({
        canvas,
        logarithmicDepthBuffer: true,
        antialias: true,
        powerPreference: "high-performance",
        alpha: false
    });

    renderer.setPixelRatio( window.devicePixelRatio );

    function updateCamera() {
        camera.updateProjectionMatrix();
    }

    // SET RAYCASTER
    const raycaster = new THREE.Raycaster();
    


    let lightBarProps = {
        DirectionalLight: true,
        HemisphereLight:false,
        AmbientLight:false,
        PointLight:false,
        Spotlights:false,
    }

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x21252d);

    document.body.addEventListener( 'mousemove', ( event ) => {
        if ( document.pointerLockElement === document.body ) {
            camera.rotation.y -= event.movementX / 500;
            camera.rotation.x -= event.movementY / 500;
        }

    } );

    function setLight(type, active){
        if(type == 'HemisphereLight'){
            if(active){
                light_objects.HemisphereLight.members.forEach((light) => {
                    scene.add(light);
                });
            }else{
                light_objects.HemisphereLight.members.forEach((light) => {
                    scene.remove(light);
                });
                light_objects.HemisphereLight.active = false;
            }
        }

        if(type == 'DirectionalLight'){
            if(active){
                light_objects.DirectionalLight.members.forEach((light) => {
                    scene.add(light);
                });
            }else{
                light_objects.DirectionalLight.members.forEach((light) => {
                    scene.remove(light);
                });
                light_objects.DirectionalLight.active = false;
            }
        }

        if(type == 'AmbientLight'){
            if(active){
                light_objects.AmbientLight.members.forEach((light) => {
                    scene.add(light);
                });    
            }else{
                light_objects.AmbientLight.members.forEach((light) => {
                    scene.remove(light);
                });
                light_objects.AmbientLight.active = false;
            }
        }

        if(type == 'PointLight'){
            if(active){
                light_objects.PointLight.members.forEach((light) => {
                    scene.add(light);
                });    
            }else{
                light_objects.PointLight.members.forEach((light) => {
                    scene.remove(light);
                });
                light_objects.PointLight.active = false;
            }
        }

        if(type == 'Spotlights'){
            if(active){
                light_objects.Spotlights.members.forEach((light) => {
                    scene.add(light);
                    // scene.add(light.target);
                });    
            }else{
                light_objects.Spotlights.members.forEach((light) => {
                    scene.remove(light);
                });
                light_objects.Spotlights.active = false;
            }

        }
    }

    // Directional Light
    {
        function DirectionalFactory(color, intensity, position){
            const light = new THREE.DirectionalLight(color, intensity);
            light.position.set(position[0], position[1], position[2]);
            return light;
        }

        light_objects.DirectionalLight.members.push(DirectionalFactory(0xFFFFFF, 0.3, [-25,50,25]));
        light_objects.DirectionalLight.members.push(DirectionalFactory(0xFFFFFF, 0.3, [25,50,25]));
        light_objects.DirectionalLight.members.push(DirectionalFactory(0xFFFFFF, 0.3, [-25,50,-25]));
        light_objects.DirectionalLight.members.push(DirectionalFactory(0xFFFFFF, 0.3, [25,50,-25]));

        light_objects.DirectionalLight.members.push(DirectionalFactory(0xFFFFFF, 0.3, [-30,0,30]));
        light_objects.DirectionalLight.members.push(DirectionalFactory(0xFFFFFF, 0.3, [30,0,30]));
        light_objects.DirectionalLight.members.push(DirectionalFactory(0xFFFFFF, 0.3, [-30,0,-30]));
        light_objects.DirectionalLight.members.push(DirectionalFactory(0xFFFFFF, 0.3, [30,0,-30]));
    }

    // HemisphereLight
    {
        const skyColor = generateRandomColor();  // light blue
        const groundColor = generateRandomColor();  // brownish orange
        const intensity = 1;
        const light = new THREE.HemisphereLight(skyColor, groundColor, intensity);
        
        light_objects.HemisphereLight.members.push(light);
    }

    // AmbientLight
    {
        const color = 0xFFFFFF;
        const intensity = 1;
        const light = new THREE.AmbientLight(color, intensity);
        light_objects.AmbientLight.members.push(light);
    }

    // PointLight
    {
        function PointLightFactory(color, intensity, position){
            const light = new THREE.PointLight(color, intensity);
            light.position.set(position[0], position[1], position[2]);
            return light;
        }

        light_objects.PointLight.members.push(PointLightFactory(0xfcba03, 1, [-25,50,25]));
        light_objects.PointLight.members.push(PointLightFactory(0xc300ff, 1, [25,50,25]));
        light_objects.PointLight.members.push(PointLightFactory(0xffffff, 1, [-25,50,-25]));
        light_objects.PointLight.members.push(PointLightFactory(0xfcba03, 1, [25,50,-25]));

        light_objects.PointLight.members.push(PointLightFactory(generateRandomColor(), 1, [-30,0,30]));
        light_objects.PointLight.members.push(PointLightFactory(generateRandomColor(), 1, [30,0,30]));
        light_objects.PointLight.members.push(PointLightFactory(generateRandomColor(), 1, [-30,0,-30]));
        light_objects.PointLight.members.push(PointLightFactory(generateRandomColor(), 1, [30,0,-30]));
    }

    // Spotlights
    {
        function SpotLightFactory(color, intensity, position, target_pos){
            const light = new THREE.SpotLight(color, intensity);
            light.position.set(position[0], position[1], position[2]);
            light.target.position.set(position[0], position[1], position[2]);
            return light;
        }
        light_objects.Spotlights.members.push(SpotLightFactory(generateRandomColor(), 1, [-25,50,25], [0,0,0]));
        light_objects.Spotlights.members.push(SpotLightFactory(generateRandomColor(), 1, [25,50,25], [0,0,0]));
    }

    setLight('DirectionalLight', true);
    
    const axesHelper = new THREE.AxesHelper( 40 );
    scene.add( axesHelper );

    function ballFactory(color){
        const obj_geometry = new THREE.SphereGeometry(SPHERE_RADIUS);
        const obj_material = new THREE.MeshPhongMaterial({color: color, shininess: 150});
        
        const wireframe_geometry = new THREE.WireframeGeometry(obj_geometry);
        const wireframe_material = new THREE.LineBasicMaterial( { color: 0xffffff } );

        let obj = {}
        obj.solid = new THREE.Mesh(obj_geometry, obj_material);
        obj.wireframe = new THREE.LineSegments(wireframe_geometry, wireframe_material);

        return obj;
    }

    function addBall(){
        let color = 0xFF0000;

        let new_position = null;
        
        while(true){
            new_position = [getRndInteger(boundary.x.min, boundary.x.max), getRndInteger(boundary.y.min, boundary.y.max), 0];
            let isOK = true;
            for(let i=0; i<CLICKABLE_OBJ.length; i++){
                if(
                    Math.abs(CLICKABLE_OBJ[i].item.solid.position.x - new_position[0]) <= SPHERE_RADIUS
                    ||
                    Math.abs(CLICKABLE_OBJ[i].item.solid.position.y - new_position[1]) <= SPHERE_RADIUS
                ){
                    isOK = false;
                    break;
                }
            }
            if(isOK){
                break;
            }
        }

        let position = new_position;
        let obj = ballFactory(color);
        obj.solid.position.set(position[0], position[1], position[2]);
        obj.wireframe.position.set(position[0], position[1], position[2]);
        
        CLICKABLE_OBJ.push({
            item: obj,
            color: color
        });

        scene.add(obj.solid);
        return obj;
    }

    let boundary = {
        x:{min:-20, max:20},
        y:{min:-20, max:20},
        z:{min:-100, max:-8},
    }

    let max_color = 10;

    let color_list = [];
    for(let i=0; i<max_color; i++){
        color_list.push({color:generateRandomColor(), displayed:0});
    }

    function resizeRendererToDisplaySize(renderer) {
        const canvas = renderer.domElement;
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        const needResize = canvas.width !== width || canvas.height !== height;
        if (needResize) {
        renderer.setSize(width, height, false);
        }
        return needResize;
    }

    for(let i=0; i<MAX_TARGET; i++){
        addBall();
    }

    function selectObject(object){
        let new_position = null;
        while(true){
            new_position = [getRndInteger(boundary.x.min, boundary.x.max), getRndInteger(boundary.y.min, boundary.y.max), 0];
            let isOK = true;
            for(let i=0; i<CLICKABLE_OBJ.length; i++){
                if(CLICKABLE_OBJ[i] == object) continue;

                if(
                    Math.abs(CLICKABLE_OBJ[i].item.solid.position.x - new_position[0]) <= SPHERE_RADIUS
                    ||
                    Math.abs(CLICKABLE_OBJ[i].item.solid.position.y - new_position[1]) <= SPHERE_RADIUS
                ){
                    isOK = false;
                    break;
                }
            }
            if(isOK){
                break;
            }
        }
        let position = new_position;

        object.item.solid.position.set(position[0], position[1], position[2]);
        score += 100;
        document.querySelector('#score').innerHTML = score;
    }

    document.body.addEventListener("click", (event) => {
        if(!THIS_ACTIVE) return;
        if(event.which == 3){
            selected_object.forEach((item) => {
                scene.remove(item.item.wireframe);
            });
        }
        document.body.requestPointerLock()

        let middle_point = new THREE.Vector2(0,0);
        raycaster.setFromCamera(middle_point, camera);
        var intersects = raycaster.intersectObjects(scene.children); //array
        
        let objectTerklik = false;
        intersects.forEach((obj)=>{
            CLICKABLE_OBJ.forEach((C_OBJ) =>{
                if(C_OBJ.item.solid == obj.object){
                    selectObject(C_OBJ);
                    objectTerklik = true;
                    const audio_click = new Audio('./roblox_death.mp3');
                    audio_click.play();
                }
            })
        });
        if(!objectTerklik){
            score -= 10;
            document.querySelector('#score').innerHTML = score;
            const audio_wiff = new Audio('./bruh.mp3');
            audio_wiff.play();
        }
    }, true);
    
    function render() {
        let currentTime = new Date();
        var timeDiff = currentTime - START_TIME; //in ms
        // strip the ms
        timeDiff /= 1000;

        // get seconds 
        var seconds = Math.round(timeDiff);
        if(seconds >= MAX_TIME){
            // alert(score);
            if(score > HIGH_SCORE){
                HIGH_SCORE = score;
            }
            GAME_STATE = "IDLE";
            document.querySelector('#mainmenu').style.display = 'flex';
            document.querySelector('#crosshair').style.display = 'none';
            document.querySelector('#score-container').style.display = 'none';
            document.querySelector('#time-container').style.display = 'none';
            document.exitPointerLock();
            scene.clear();
            THIS_ACTIVE = false;
            // Game Ended, Then Show Score
            return;
        }

        document.querySelector('#time').innerHTML = MAX_TIME - seconds;

        if (resizeRendererToDisplaySize(renderer)) {
            console.log("RESIZED")
            const canvas = renderer.domElement;
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            camera.updateProjectionMatrix();
        }

        renderer.render( scene, camera );
        if(GAME_STATE != "IDLE"){
            requestAnimationFrame( render );
        }
    }

    render();

};

let currentRunningProgram = null;

document.querySelector('#mainmenu').addEventListener('click', (event) => {
    document.querySelector('#mainmenu').style.display = 'none';
    document.querySelector('#crosshair').style.display = 'flex';
    document.querySelector('#score-container').style.display = 'flex';
    document.querySelector('#time-container').style.display = 'flex';
    document.body.requestPointerLock();
    GAME_STATE = "PLAY";
    START_TIME = new Date();
    document.querySelector('#highscore').innerHTML = HIGH_SCORE;
    currentRunningProgram = animate();
})

// animate();