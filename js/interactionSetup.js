			function onWindowResize() {

				//Create the width and heights using some jQuery magic
				canvasheight = $( "#container" ).height() // Adjust for the bottom bar
				canvaswidth = $( "#container" ).width()
				camera.aspect = canvaswidth / canvasheight ;
				camera.updateProjectionMatrix();

				renderer.setSize( canvaswidth , canvasheight   );
				stats.update();

				//Fix attributes window on resize
				var infoHeight = $('#info').height()
				var layersHeight = $("#layers").height()
				var newHeight = infoHeight - layersHeight;
				$("#attributes").height( newHeight );

			}
	function render() {
		renderer.render(scene, camera);
	}

			function animate() {
				requestAnimationFrame( animate );
				var delta = clock.getDelta();
				if (controls) {
					controls.update(delta);
				}
				stats.update();
				render();


				var frustum = new THREE.Frustum();
				var cameraViewProjectionMatrix = new THREE.Matrix4();
				camera.updateMatrixWorld(); // make sure the camera matrix is updated

				camera.matrixWorldInverse.getInverse( camera.matrixWorld );
				cameraViewProjectionMatrix.multiplyMatrices( camera.projectionMatrix, camera.matrixWorldInverse );
				frustum.setFromMatrix( cameraViewProjectionMatrix );
				// frustum is now ready to check all the objects you need


			}



