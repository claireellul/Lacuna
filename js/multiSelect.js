function calculateIntersection(camera,vector,changeColour,drawPoint, intersectObjects){
	// take the screen click vector which has been rescaled so that the value of x and y is between -1 and + 1
	// and that 0,0 is in the middle and axes are pointing in three.js directions not screen direction
	// convert it to a real world point close to the camera
	// draw a ray from the camera through this point to the geometetry in the scene
	// intersect the ray with the geometry
	// optionally, change the colour of the geometry and draw the intersection point
	// return the array of intersected objects for further processing - e.g. get attributes, info etc.

					vector.unproject( camera );
					// nb: the ray caster is set to intersect ANY object in the ray not just the first
					raycaster.ray.set( camera.position, vector.sub( camera.position ).normalize(),true );
					var intersects = raycaster.intersectObjects( intersectObjects );
					if ( intersects.length > 0 ) {
						if (drawPoint===true) {
								var PI2 = Math.PI * 2;
								var    particleMaterial = new THREE.SpriteCanvasMaterial( {
						        color: 0xff0000,
						        program: function ( context ) {
						            context.beginPath();
						            context.arc( 0, 0, 0.5, 0, PI2, true );
						            context.fill();
								}
							 	} );
								var particle = new THREE.Sprite( particleMaterial );
								particle.position.copy( intersects[ 0 ].point );
								particle.scale.x = particle.scale.y = 1;
								scene.add( particle );
						}
						if (changeColour===true) {
							var colour =  Math.random() * 0xffffff;
							for (i = 0;i < intersects.length; i ++) {
								intersects[ i ].object.material.color.setHex(colour );
							}
						}
						return intersects;
					}
}

function rescaleAndCentre(screenPointX, screenPointY){

	// screen coords are 2d and have +y running top to bottom with the origin at top left
	// threejs coords are 3d, have +y running bottom to top, with the origin at the centre
	// this function rescales and shifts the mouse click event into threejs coords
	// with resulting x and y values from -1 to + 1

	// NB:  this function needs a FIXED POSITION div to work, which must have hard coded top and left values
	// setting teh DIV size for the canvas using %width or %height fails

	// with a fixed position div
	var offset = 350; //document.getElementById('container').style.left;
	var top = 47; //document.getElementById('container').style.top;
	var height = document.getElementById('container').offsetHeight;

	// use a small shrinkage factor as this seems to improve click accuracy?
	var width = document.getElementById('container').clientWidth-20;

	var partialY = -((screenPointY - top)/height) * 2 + 1;
	var partialX = (screenPointX-offset)/width*2 -1;
	console.log("Partial X and Y "+partialX + " "+partialY);
	var vector = new THREE.Vector3();
	vector.set( partialX, partialY, 0.5 );
	return vector;
}

function make_multi_selection() {

	// idea for multi-select
	// take the marquee boundaries
	// find out where they intersect the 2D surface of the world by creating a 'fake' geometry
	// use this as the MBR
	// same method can be used for dynamic data retrieval
	// then project the 3D scene data into 2D
	// and calculate teh intersection
	// use vector maths for the 'fake' geometry - take the line, and calculate the intersection point with z = 0 plane;

	// or use PROJECT ON PLANE functionality provided by three.js?

		scene.children.forEach( function(o) {
			isMesh = (o instanceof THREE.Mesh);
			isObject3D = (o instanceof THREE.Object3D);
			isLine = (o instanceof THREE.Line);
			isAxis = (o instanceof THREE.AxisHelper);
			isHelper = ((o.hasOwnProperty('name')) && (o.name === "Helper"));
			console.log(o.type+ " "+isMesh + " " +isObject3D + " "+isLine + " "+isAxis + " " +isHelper);
			oGeom = o.geometry;
			var minx= 99999999; var miny= 99999999; var maxx = 0; var maxy = 0;
//			console.log("00000000000000000000000000 " + oGeom.vertices[0].x);
			if ((isMesh || isLine) && ((isHelper === false) && (isAxis === false))) {
					// go through vertex by vertex
					for (i = 0; i < oGeom.vertices.length; i++) {
						v = o.geometry.vertices[i]
						console.log(v);
						vector = new THREE.Vector3( v.x, v.y,0)
						if (minx > v.x) {minx = v.x;}
						if (miny > v.y) {miny = v.y;}
						if (maxy < v.y) {maxy = v.y;}
						if (maxx < v.x) {maxx = v.x;}
						if ((is_inside_marquee(vector)) && (SELECTED.sceneobject.indexOf(o) === -1 )) {
							// add to the highlighed objects
									SELECTED.sceneobject.push(o);
									SELECTED.color.push(o.material.color.clone());
									o.material.color.setHex( 0xCCCCCC );
									if (o.material.hasOwnProperty("ambient")) {
										o.material.ambient.setHex ( 0xCCCCCC );
									}
						}
					}
					console.log(minx + "  "+ miny + "  "+maxx + " " +maxy);
			}


		});
}

//			var insideMarquee = false;
//			var multiProjector = new THREE.Projector();
/*			var frustum = new THREE.Frustum(); // Create Frustrum
			frustum.setFromMatrix( new THREE.Matrix4().multiplyMatrices( camera.projectionMatrix, camera.matrixWorldInverse ) ); //Get frustum of current camera shot
			var position = new THREE.Vector3();
*/

//					if (frustum.intersectsObject(o)) {
						//console.log("intersected node");
/*						isPoint = (oGeom instanceof THREE.SphereGeometry)
						if (isPoint) {
							v = new THREE.Vector3(oGeom.x, oGeom.y,0);
							position.setFromMatrixPosition( o.matrixWorld );
							v = position
							if (frustum.containsPoint(v)) {
								projectedVector = multiProjector.projectVector( v, camera ); //Project the point into 2D
								insideMarquee = is_inside_marquee(projectedVector) // Check if point is in marquee
								if ((insideMarquee) && (SELECTED.sceneobject.indexOf(o) === -1 )) {
									SELECTED.sceneobject.push(o);
									SELECTED.color.push(o.material.color.clone())
									o.material.color.setHex( 0xCCCCCC )
									if (o.material.hasOwnProperty("ambient")) {
										o.material.ambient.setHex ( 0xCCCCCC )
									}
								}
							}

						}
						else if (isPoint === false) {
							for (i = 0; i < o.geometry.vertices.length; i++) {
								v = o.geometry.vertices[i]
								console.log(v);
								if (frustum.containsPoint(v)) {
									console.log("sphere vertex detected");
									console.log(v);
									vec = new THREE.Vector3( v[0], v[1],v[2])
									projectedVector = multiProjector.projectVector( vec.clone(), camera ); //Project the point into 2D
									console.log(projectedVector);
									insideMarquee = is_inside_marquee(projectedVector) // Check if point is in marquee
									if ((insideMarquee) && (SELECTED.sceneobject.indexOf(o) === -1 )) {
										SELECTED.sceneobject.push(o);
										SELECTED.color.push(o.material.color.clone())
										o.material.color.setHex( 0xCCCCCC )
										if (o.material.hasOwnProperty("ambient")) {
											o.material.ambient.setHex ( 0xCCCCCC )
										}
										break;
									} // Push object to SELECTED array if it's not already in there
								}
							}
						}
					}
				}

				if ((isObject3D) && ((isHelper === false) && (isAxis === false))) {
					childBreak = false
					//console.log("Object3D in scene", o);
					for (i = 0; i < o.children.length; i++) {
						m  = o.children[i]
						// If Mesh intersects frustum
						if (frustum.intersectsObject(m)) {
							for (j = 0; j < m.geometry.vertices.length; j++) {
								v =  m.geometry.vertices[j]
								// If vertex intersects frustum
								if (frustum.containsPoint(v)) {
									console.log("vertex "+v);
									projectedVector = multiProjector.projectVector( v.clone(), camera );
									insideMarquee = is_inside_marquee(projectedVector) // Check if point is in marquee
									if ((insideMarquee) && (SELECTED.sceneobject.indexOf(o) === -1 )) {
										SELECTED.sceneobject.push(o)
										SELECTED.color.push(m.material.color.clone());
										o.children.forEach( function (c) {
											c.material.color.setHex( 0xCCCCCC )
											c.material.ambient.setHex ( 0xCCCCCC )
										});
										childBreak = true;
										break;
									} // Push object to SELECTED array if it's not already in there
								}
							};
							if (childBreak) { break; }
						}
					};
				}
			});

			*/
