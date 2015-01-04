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

function setupEvents(){

				$('#container').click( function(event) {
					console.log("container click");
					// first rescale and recentre the click
					var vector = rescaleAndCentre(event.clientX,event.clientY);
					var intersection = calculateIntersection(camera,vector, true, true, sceneobjects);
					//processClick();
				});
				$('#container').mouseup( function(event) {
					//console.log("container click");
						if ((overMap === true ) && (MULTISELECT === false) && (SELECT ===false)) {
							controls.mouseup(event);
						}
				});
				$('#container').mousedown( function(event) {
					//console.log("container click");
						if ((overMap === true ) && (MULTISELECT === false) && (SELECT ===false)) {
							controls.mousedown(event);
						}
				});

				// set a flag to test whether the mouse is over the actual map
				$("#container").mouseenter(function(){
				    overMap = true;
				}).mouseleave(function(){
				    overMap = false;
				});



				$("#container").mousemove(function(event){
					//console.log("container mousemoved");
					//console.log("mousemove "+SELECT + " " + MULTISELECT + " "+select);
					// dont use the move 'look around' as there is no way to stop the movement
					if ((keyIsPressed === true) && ((MULTISELECT === true) && (SELECT === false)) ) {
						if ((keyPressedCoords.x === 0) && (keyPressedCoords.y === 0)) {
							//console.log("setting initial coords");
							keyPressedCoords.x = event.clientX;
							keyPressedCoords.y = event.clientY;
							firstKeyPress = false
						}
						//console.log(mousedowncoords.x, mousedowncoords.y);

						//console.log("mouseover");
						var pos = {};
						//console.log(keyPressedCoords.x);
						pos.x = event.clientX - keyPressedCoords.x;
						pos.y = event.clientY - keyPressedCoords.y;
						//console.log(pos.x, pos.y);
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
					// this is a zoom or pan event
					else {
						//console.log("AAAAAAAAAAAAAAAAAA");
						if ((overMap === true ) && (MULTISELECT === false) && (SELECT ===false)) {
						//	console.log("BBBBBBBBBBBBBBB");
							controls.mousemove(event);
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
					// as keydown event doesn't work for divs in firefox, before we fire the zoom/pan event we need to check where
					// the mouse is
					if ((overMap === true ) && (MULTISELECT === false) && (SELECT ===false)) {
						// this is a zoom/pan etc event
					//	controls.handleEvent(event);
						console.log("key clicked over the map");
					//	controls2.onKeyDownPointerLock(event);
						controls.keydown(event);
					}
				});
			$(document).on('keyup', function(e) {
				console.log("document keyup");
				//close marquee
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
				if ((overMap === true ) && (MULTISELECT === false) && (SELECT ===false)) {
					//controls.handleEvent(e);
					controls.keyup(e);

				}
			});
			$(document).on('keypress', function (e) {
				console.log("document keypress");
				//console.log(e);
				var code = e.keyCode || e.which;
				//console.log(code);
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
				else {
						if ((overMap === true ) && (MULTISELECT === false) && (SELECT ===false)) {
							//controls.handleEvent(event);
							//controls.keypress(e);
						}
			}
			});

			$('#loadselected').click( function() {
				if ((SELECT === true || MULTISELECT === true) && (SELECTED.sceneobject.length != 0)) {
					getattributes()
				}
			});


}