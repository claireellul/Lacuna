function make_multi_selection() {
		scene.children.forEach( function(o) {
			isMesh = (o instanceof THREE.Mesh);
			isObject3D = (o instanceof THREE.Object3D);
			isLine = (o instanceof THREE.Line);
			isAxis = (o instanceof THREE.AxisHelper);
			isHelper = ((o.hasOwnProperty('name')) && (o.name === "Helper"));
			console.log(o.type+ " "+isMesh + " " +isObject3D + " "+isLine + " "+isAxis + " " +isHelper);
			oGeom = o.geometry;
//			console.log("00000000000000000000000000 " + oGeom.vertices[0].x);
			if ((isMesh || isLine) && ((isHelper === false) && (isAxis === false))) {
					// go through vertex by vertex
					for (i = 0; i < oGeom.vertices.length; i++) {
						v = o.geometry.vertices[i]
						console.log(v);
						vector = new THREE.Vector3( v[0], v[1],0)
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