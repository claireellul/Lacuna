				// MULTISELECT
				var marquee = $("#select-marquee")
				var offset = {};
				var keyIsPressed = false
				var firstKeyPress = false
				var keyPressedCoords = {x: 0, y: 0};
				var canvasLeftOffset = $( "#info" ).width();
				var canvasTopOffset = $( "#topbar").height();
				var canvasWidth = window.innerWidth -  canvasLeftOffset;
				var	canvasHeight = window.innerHeight - canvasTopOffset;
				// CLICK HANDLER
				var firstClick = true
				var objectFirstClick = true
				var p1
				var p2
				var l1
				var l2

function cancelEvents(){
	// clear all the interaction events that are interacting with the canvas
	// this is used when the user is in zoom/pan mode

			$('#container').click( function(event) {
					//processClick();
			});
			$('#container').mouseup( function(event) {
			});
			$('#container').mousedown( function(event) {
			});

			// set a flag to test whether the mouse is over the actual map
			$("#container").mouseenter(function(event){
			});
			$("#container").mousemove(function(event){
			});
			$(document).keydown( function(event) {
			});
			$(document).on('keyup', function(e) {
			});
			$(document).on('keypress', function (e) {
			});



}

function setupEvents(){

	// any events on the container or the rest of the document should initially go through here
	// except for the toolbar events, which are handled in toolbar.js
	// both of these files should be clear to set the current interaction mode as the behaviour of Lacuna will differ

				$('#container').click( function(event) {
					//processClick();
				});
				$('#container').mouseup( function(event) {
				});
				$('#container').mousedown( function(event) {
				});

				// set a flag to test whether the mouse is over the actual map
				$("#container").mouseenter(function(event){
				    overMap = true;
				}).mouseleave(function(){
				    overMap = false;
				});

				$("#container").mousemove(function(event){
					if ((keyIsPressed === true) && ((MULTISELECT === true) && (SELECT === false)) ) {
						if ((keyPressedCoords.x === 0) && (keyPressedCoords.y === 0)) {
							//console.log("setting initial coords");
							keyPressedCoords.x = event.clientX;
							keyPressedCoords.y = event.clientY;
							firstKeyPress = false
						}
						var pos = {};
						pos.x = event.clientX - keyPressedCoords.x;
						pos.y = event.clientY - keyPressedCoords.y;
						// square variations
						// (0,0) origin is the TOP LEFT pixel of the canvas.
						//
						//  1 | 2
						// ---.---
						//  4 | 3
						// there are 4 ways a square can be gestured onto the screen.  the following detects these four variations
						// and creates/updates the CSS to draw the square on the screen
						if (pos.x < 0 && pos.y < 0) {
							marquee.css({left: event.clientX + 'px', width: -pos.x + 'px', top: event.clientY + 'px', height: -pos.y + 'px'});
						} else if ( pos.x >= 0 && pos.y <= 0) {
							marquee.css({left: keyPressedCoords.x + 'px',width: pos.x + 'px', top: event.clientY, height: -pos.y + 'px'});
						} else if (pos.x >= 0 && pos.y >= 0) {
							marquee.css({left: keyPressedCoords.x + 'px', width: pos.x + 'px', height: pos.y + 'px', top: keyPressedCoords.y + 'px'});
						} else if (pos.x < 0 && pos.y >= 0) {
							marquee.css({left: event.clientX + 'px', width: -pos.x + 'px', height: pos.y + 'px', top: keyPressedCoords.y + 'px'});
						}
					}
			});
				$(document).keydown( function(event) {
					console.log("keydown "+SELECT + " " + MULTISELECT + " "+select);
					console.log("document keydown");
					if ((MULTISELECT === true) && (SELECT === false)) {
						code = event.keyCode || event.which;
						keyIsM = ((String.fromCharCode(code) == "m") ||  (String.fromCharCode(code) == "M" ))
						if (keyIsM === true) {
							if ((keyPressedCoords.x === 0) && (keyPressedCoords.y === 0))  {
								firstKeyPress = true
								marquee.fadeIn();
							}
							keyIsPressed = true
						}
					}
				});
			$(document).on('keyup', function(e) {
				console.log("document keyup");
				console.log("keyup "+SELECT + " " + MULTISELECT + " "+select);
				if (MULTISELECT === true) {
					keyIsM = ((String.fromCharCode(code) == "m") ||  (String.fromCharCode(code) == "M" ))
					console.log("m "+ keyIsM + " firstkey press "+firstKeyPress + " "+keyPressedCoords.y);
					if ((keyIsM === true) && (firstKeyPress === false) && (keyPressedCoords.y !=0) &&(keyPressedCoords.x != 0)) {
						firstKeyPress = false;
						// m was pressed again to close the selection
						make_multi_selection();
						//console.log("key let go");
						keyIsPressed = false;
						keyPressedCoords = {x: 0, y: 0};
						marquee.fadeOut();
						marquee.css({width: 0, height: 0});
						selectcoords = {};
					}
				}
			});
			$(document).on('keypress', function (e) {
				console.log("document keypress");
				//console.log(e);
				var code = e.keyCode || e.which;
				//console.log(code);

				// if the escale key is pressed, then cancel all functionality and go back to zoom mode
				if(e.which == 27){
					interactionMode = "ZOOM";
					changeInteractionMode(interactionMode);
				}


				keyIsM = ((String.fromCharCode(code) == "m") ||  (String.fromCharCode(code) == "M" ))
				objectIsIntersected = ((intersectedObject !== "" ) || ( intersectedMesh !== "" ))

				if ( SELECT && keyIsM && objectIsIntersected ){
					console.log("m and select");
					aObject3D = ((intersectedObject instanceof THREE.Object3D === true ) && intersectedObject instanceof THREE.Scene === false && intersectedMesh instanceof THREE.AxisHelper === false );
					aMeshObject = ((intersectedMesh instanceof THREE.Mesh === true ) && (intersectedObject instanceof THREE.Scene === true ));
					aLineObject = (intersectedMesh instanceof THREE.Line === true && intersectedMesh instanceof THREE.AxisHelper === false );
					//console.log(aObject3D, aMeshObject, aLineObject);
					if ( aObject3D || aMeshObject || aLineObject ) {
						//console.log($.inArray(intersectedObject, SELECTED), SELECTED)
						//console.log(aObject3D);
						//console.log();
						if (aObject3D === true) { inSelected = SELECTED.sceneobject.indexOf(intersectedObject) }
						else if (aLineObject === true || aMeshObject === true ) { inSelected = SELECTED.sceneobject.indexOf(intersectedMesh) }
						//console.log(inSelected)

						// If object hasn't been selected
						if (inSelected  === -1) {

							//console.log(intersectedObject)
							 if (aObject3D === true) {
								//console.log(intersectedObject)
								console.log(intersectedObject);
								colorArray = [];

								intersectedObject.children.forEach( function(child, childIndex) {
									if (childIndex === 0) {
										objectColour = child.material.color.clone();
									}
									child.material.color.setHex( 0xCCCCCC )
									if (child.material.hasOwnProperty("ambient")) { child.material.ambient.setHex( 0xCCCCCC ) }
								});
								console.log("adding ", intersectedObject, " to SELECTED");
								SELECTED.sceneobject.push(intersectedObject)
								SELECTED.color.push(objectColour)
								console.log(SELECTED);

							}

							else if ((aLineObject === true || aMeshObject === true) && (intersectedMesh.name != "Helper")) {
								console.log("adding ", intersectedMesh, " to SELECTED");
								SELECTED.sceneobject.push(intersectedMesh)
								SELECTED.color.push(intersectedMesh.material.color.clone())
								intersectedMesh.material.color.setHex( 0xCCCCCC )
								if (intersectedMesh.material.hasOwnProperty("ambient")) { intersectedMesh.material.ambient.setHex( 0xCCCCCC ) }

							}
						}

						// If object has been selected before
						if (inSelected  != -1) {

							if (aObject3D === true) {
								intersectedObject.children.forEach( function(child, colIndex) {
									console.log(SELECTED.color[inSelected])
									child.material.color.set( SELECTED.color[inSelected] )
									if (child.material.hasOwnProperty("ambient")) { child.material.ambient.setHex( SELECTED.color[inSelected] ) }

								});
								//console.log("removing ", intersectedObject, " to SELECTED");
								SELECTED.sceneobject.splice(inSelected, 1);
								//console.log(SELECTED.sceneobject);
								SELECTED.color.splice(inSelected, 1);
							}

							else if ((aLineObject === true || aMeshObject === true) && (intersectedMesh.name != "Helper")) {

								//console.log("remove color",
								intersectedMesh.material.color.set( SELECTED.color[inSelected] )
								if (intersectedMesh.material.hasOwnProperty("ambient")) { intersectedMesh.material.ambient = SELECTED.color[inSelected] }
								SELECTED.sceneobject.splice(inSelected, 1);
								SELECTED.color.splice(inSelected, 1);

							}
						}
					}
				}
			});

			$('#loadselected').click( function() {
				if ((SELECT === true || MULTISELECT === true) && (SELECTED.sceneobject.length != 0)) {
					getattributes()
				}
			});


}
function changeInteractionMode(newMode) {
	// then just set the correct mode to true
	// basic modes are current ZOOM and NOTZOOM

	// SUB modes are as follows (NOT ALL CURRENTLY IMPLEMENTED):


	/*
		SELECT = SELECT OR MULTISELECT
		EDITGEOMETRY = EDIT VERTEX, EDIT GEOMETRY
		EDITATTRIBUTE
		BUFFER = BUFFER, INTERSECT, MERGE
		GETINFO = GET INFO ABOUT ONE OR MORE OBJECTS
		CREATE NEW
		DELETE
		MEASURE

	*/

	interactionMode = newMode;

	// also disable the appropriate event handlers
	if (interactionMode == "ZOOM"){
			// disable the other events on the canvas
			cancelEvents();

			// create the required zoom/pan controls depending on the last used interaction mode
			setupControls(controlsMode);
	}
	else {
		// disable zoom/pan interaction by destroying the controls object
		if (controls) {
			controlsTarget = controls.target; // keep track of the current target for when the controls are re-enabled
			controls = null;
			setupEvents(); // handle any other form of interaction
		}

	}


}

function setupControls(controlsMode) {
	// add functionality to highlight where the user clicks

	$('#container').click( function(event) {
		console.log("container click");
		// first rescale and recentre the click
		var vector = rescaleAndCentre(event.clientX,event.clientY);
		var intersection = calculateIntersection(camera,vector, true, true, sceneobjects);
		//processClick();
	});


	if (controls) {
		controlsTarget = controls.target;
		controls = null;
	}
	if (controlsMode == "TRACKBALL") {
		console.log("trackball clicked");
		controls = new THREE.TrackballControls( camera, renderer.domElement );
		controls.enabled = true;
		controls.rotateSpeed = 0.6;
		controls.zoomSpeed = 1.0;
		controls.panSpeed = 1.0;
		controls.noZoom = false;
		controls.noPan = false;
		controls.staticMoving = true;
		controls.dynamicDampingFactor = 0.3;
		controls.keys = [ 65, 83, 68 ];
		controls.target = controlsTarget;
		controls.addEventListener( 'change', render );


	}
	if (controlsMode == "FLY"){
		controls = new THREE.FlyControls(camera,renderer.domElement );
	   controls.movementSpeed = 25;
	   controls.rollSpeed = Math.PI/24;
		controls.minDistance = 0.01;
		controls.maxDistance = 10000;
	   controls.autoForward = false;
	   controls.target = controlsTarget;
	   controls.dragToLook = true;
	}
	if (controlsMode == "FIRSTPERSON") {
		console.log("firstperson clicked");
		controls = new THREE.FirstPersonControls(camera);
		controls.lookSpeed = 0.4;
		controls.movementSpeed = 20;
		controls.noFly = false;
		controls.lookVertical = true;
		controls.constrainVertical = false;
		controls.target = controlsTarget;
/*		  if (isFunction(controls.handleEvent)){
		  } else {
					controls.handleEvent = function ( event ) {
						if ( typeof this[ event.type ] == 'function' ) {
							this[ event.type ]( event );
						}
				};
		  } */
	}
}