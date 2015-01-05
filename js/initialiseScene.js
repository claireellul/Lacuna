var clock;
function init() {
	container = document.getElementById("container")
	clock = new THREE.Clock();

	//Create the width and heights using some jQuery magic
	canvasheight = $( "#container" ).height()
	canvaswidth = $( "#container" ).width()

	// Load Stats
	stats = new Stats();
	stats.setMode(0);
	container.appendChild( stats.domElement );

	/* THIS VERSION WORKS
	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );
	renderer = new THREE.WebGLRenderer(); renderer.setSize( window.innerWidth, window.innerHeight );
	container.appendChild( renderer.domElement );

	var geometry = new THREE.BoxGeometry( 1, 1, 1 );
	var material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
	var cube = new THREE.Mesh( geometry, material );
	scene.add( cube );
	camera.position.z = 5;

	controls = new THREE.TrackballControls( camera, renderer.domElement );
	controls.rotateSpeed = 0.6;
	controls.zoomSpeed = 1.0;
	controls.panSpeed = 1.0;
	controls.noZoom = false;
	controls.noPan = false;
	controls.staticMoving = true;
	controls.dynamicDampingFactor = 0.3;
	controls.minDistance = 50;
	controls.maxDistance = 8000;
	controls.keys = [ 65, 83, 68 ];

	var render = function () { requestAnimationFrame( render );
	renderer.render(scene, camera);};

	render();
	*/


	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera( 120, canvasWidth/canvasHeight, 1, 10000 );
	renderer = new THREE.WebGLRenderer({ antialias: true });
	//renderer = new THREE.CanvasRenderer();

	renderer.setSize( canvasWidth, canvasHeight );
	container.appendChild( renderer.domElement );
	controlsTarget = new THREE.Vector3(CENTROID[0]+5,CENTROID[1],0);
	controlsMode == "TRACKBALL"
	setupControls("TRACKBALL");
	interactionMode = "ZOOM";

	camera.position.x = CENTROID[0];
	camera.position.y = CENTROID[1]-100;
	camera.position.z = 50;


	// +ve z = out of the screen towards observer's eye
	// +x = along the screen left/right
	// +y =up the screen
	// red is x
	// green is y


	// include a hidden 3D geometry in the scene
	// this has been shown to make the ray tracing procedure much more accurate than hidden
	// 2D planar triangles
	// NB this is not itself added to the 'sceneobjects' array which contains the visible scene geometry
	var geometry = new THREE.BoxGeometry( 10000, 10000, 10 );
		var object = new THREE.Mesh( geometry, new THREE.MeshBasicMaterial( { color: Math.random() * 0xffffff, opacity: 0.5 } ) );
		object.position.x =  CENTROID[0];
		object.position.y =  CENTROID[1];
		object.position.z = -10;
		object.name = "baseGeometry";
		scene.add( object );
		sceneobjects.push(object);




	axes = new THREE.AxisHelper(200);
	// NB:  THIS DOESN'T WORK  axes.position = new THREE.Vector3D (X,y,z);
	axes.position.x = CENTROID[0];
	axes.position.y = CENTROID[1];
	axes.position.z = 0;
	scene.add( axes );

	addAxesText(axes);
	raycaster = new THREE.Raycaster();

	camera.lookAt( scene.position );
	animate();
	addedToScene = []
	visibleBools = []
	addLayers();

}
function addAxesText(axes) {
			var  textGeo = new THREE.TextGeometry('Y', {
			  size: 50,
				height: 5,
				curveSegments: 2,
			font: "helvetiker"
			});

			var  color = new THREE.Color();
			color.setRGB(255, 250, 250);
			var  textMaterial = new THREE.MeshBasicMaterial({ color: color });
			var  text = new THREE.Mesh(textGeo , textMaterial);

			text.position.x = axes.position.x;
			text.position.y = axes.position.y+400;
			text.position.z = axes.position.z;
			text.rotation = camera.rotation;
			scene.add(text);


				var  textGeo = new THREE.TextGeometry('X', {
				  size: 50,
				  height: 5,
				font: "helvetiker"
				});
			var  color = new THREE.Color();
			color.setRGB(255, 250, 250);
			var  textMaterial = new THREE.MeshBasicMaterial({ color: color });
			var  text = new THREE.Mesh(textGeo , textMaterial);

			text.position.x = axes.position.x+400;
			text.position.y = axes.position.y;
			text.position.z = axes.position.z;
			text.rotation = camera.rotation;
			scene.add(text);

}


function addLayers(){
	jsLayerList.forEach( function(jsLayer) {
		visibleBools.push(false);
		$("#".concat(jsLayer)).on('click', function() {
			if (visibleBools[jsLayerList.indexOf(jsLayer)] === false) {
				layerName = '"'.concat(jsLayer).concat('"');
				// if there is no data in the layer, then loada the layer data
				if ($.inArray(jsLayer, addedToScene) === -1) {
					console.log("Loading from PG")
					loadLayer(jsLayer);
					addedToScene.push(jsLayer);
				}
				else {
					// switch the layer on
					scene.children.forEach( function(childLayer) {
						if (childLayer.name != undefined || childLayer.name === "") {
							if (childLayer.name.lastIndexOf(jsLayer, 0) === 0) {
								console.log("Loading from geometry")
								childLayer.traverse( function ( object ) { object.visible = true; } );
							}
						}
					});
				} // inArray
				visibleBools[jsLayerList.indexOf(jsLayer)] = true;
			} // visiblebools = false
			else if (visibleBools[jsLayerList.indexOf(jsLayer)] === true) {
				// hide the layer data
				scene.children.forEach( function(childLayer) {
					if (childLayer.name != undefined || childLayer.name === "") {
								if (childLayer.name.lastIndexOf(jsLayer, 0) === 0) {
									console.log("Disabling geometry")
									childLayer.traverse( function ( object ) { object.visible = false; } );
								}
					}
				});
				visibleBools[jsLayerList.indexOf(jsLayer)] = false;
			} // visibleBools === true
		}); // concat jslayer
	}); // foreach function jslayer
}
function degInRad(deg) {
    return deg * Math.PI / 180;
}