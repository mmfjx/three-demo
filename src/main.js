    //Declare three.js variables
    var camera, scene, renderer, stars=[], line, circleScale = 1, line1, flyLine;

    //assign three.js objects to each variable
    function init(){

        //camera
        camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
        camera.position.z = 50;

        //scene
        scene = new THREE.Scene();

        scene.background = new THREE.Color().setHSL( 0.51, 0.4, 0.01 );

        //renderer
        renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true
        });
        //set the size of the renderer
        renderer.setSize( window.innerWidth, window.innerHeight );

        //add the renderer to the html document body
        document.body.appendChild( renderer.domElement );

        // var geometry = new THREE.SphereBufferGeometry(2, 64, 64)
        // var material = new THREE.MeshBasicMaterial( {color: 0xee0000} );
        // var sphere = new THREE.Mesh(geometry, material)

        // var light = new THREE.PointLight( 0xff0000, 10, 1000 );
        // light.add( new THREE.Mesh( geometry, material) );
        // light.position.set(0, 0, 0);

        // var textureLoader = new THREE.TextureLoader();
        // var textureFlare0 = textureLoader.load( 'https://s3plus.meituan.net/v1/mss_814dc1610cda4b2e8febd6ea2c809db5/distribute/28f3391f-ba4e-4cc4-85bf-2f6e4fa32537_1542252858133?filename=lensflare0.png' );
        // var flareColor = new THREE.Color(0xffffff);
        // var textureFlare3 = textureLoader.load( 'https://s3plus.meituan.net/v1/mss_814dc1610cda4b2e8febd6ea2c809db5/distribute/8e58a264-6ae0-4f18-88f4-dc421a027e6b_1542252865862?filename=lensflare3.png' );
        // var lensflare = new THREE.Lensflare();
        // lensflare.addElement( new THREE.LensflareElement( textureFlare0, 64, 0, flareColor) );
        // lensflare.addElement( new THREE.LensflareElement( textureFlare3, 32, 0, flareColor) );
        // // lensFlare.customUpdateCallback = lensFlareUpdateCallback.bind(this);
        // light.add( lensflare );
        // // scene.add(light);

        // var circleGeo = new THREE.CircleGeometry(3, 24);
        // circleGeo.vertices.shift();
        // var circleMaterial = new THREE.MeshBasicMaterial( {color: 0xfffff} );
        // var circle = new THREE.Mesh(circleGeo, circleMaterial);
        // scene.add(circle);



        // circleRadius = 4;
        // var circleShape = new THREE.Shape();
        // circleShape.moveTo( 0, 0 );
        // circleShape.absarc( 0, 0, circleRadius, 0, Math.PI * 2, false );

        // circleShape.autoClose = true;

        // var circleShape = createCircleShape(4);
        // var points = circleShape.getPoints(36);
        // var geometryPoints = new THREE.BufferGeometry().setFromPoints( points );
        // // solid line
        // line = new THREE.Line( geometryPoints, new THREE.LineBasicMaterial( {
        //     color: 0xff0000,
        //     linewidth: 0.5,
        // } ) );
        // line.position.set( 0, 0, 0);
        // // line.rotation.set( rx, ry, rz );
        // // line.scale.set( s, s, s );
        // scene.add(line);

        // circleShape = createCircleShape(4.1);
        // points = circleShape.getPoints(36);
        // geometryPoints = new THREE.BufferGeometry().setFromPoints( points );
        // // solid line
        // line1 = new THREE.Line( geometryPoints, new THREE.LineBasicMaterial( {
        //     color: 0xff0000,
        //     linewidth: 0.5,
        // } ) );
        // line1.position.set( 0, 0, 0);
        // scene.add(line1);

        flyLine = new FlyLine({
            startPos: new THREE.Vector3(0, 0, 0),
            endPos: new THREE.Vector3(50, 0, 0),
            height: 0,
        });
        this.scene.add(flyLine.curve);


    }

    function createLineMesh (shape) {
        let points = shape.getPoints(36);
        let geometryPoints = new THREE.BufferGeometry().setFromPoints( points );
        // solid line
        line1 = new THREE.Line( geometryPoints, new THREE.LineBasicMaterial( {
            color: 0xff0000,
            linewidth: 0.5,
        } ) );
    }

    function createCircleShape (radius) {
        var circleShape = new THREE.Shape();
        circleShape.moveTo( 0, 0 );
        circleShape.absarc( 0, 0, radius, 0, Math.PI * 2, false );
        circleShape.autoClose = true;
        return circleShape;
    }

    function addSphere(){

        // The loop will move from z position of -1000 to z position 1000, adding a random particle at each position.
        for ( var z= -1000; z < 1000; z+=20 ) {

            // Make a sphere (exactly the same as before).
            var geometry   = new THREE.SphereBufferGeometry(0.5, 32, 32)
            var material = new THREE.MeshLambertMaterial( {color: 0x80ff80} );
            var sphere = new THREE.Mesh(geometry, material)
            var light = new THREE.PointLight( 0x80ff80, 10, 100 );
            light.add( new THREE.Mesh( geometry, material) );


            function lensFlareUpdateCallback(object) {
                let f = this.lensFlares.length;
                let fl = this.lensFlares.length;
                let flare;
                let vecX = -this.positionScreen.x * 2;
                let vecY = -this.positionScreen.y * 2;
                let size = object.size ? object.size : 16000;

                let camDistance = camera.position.length();

                // let heatVisionValue = pSystem ? pSystem.shaderMaterial.uniforms.heatVision.value : 0.0;

                for (f = 0; f < fl; f++) {

                    flare = this.lensFlares[ f ];

                    flare.x = this.positionScreen.x + vecX * flare.distance;
                    flare.y = this.positionScreen.y + vecY * flare.distance;

                    // flare.wantedRotation = flare.x * Math.PI * 0.25;
                    // flare.rotation += ( flare.wantedRotation - flare.rotation ) * 0.25;

                    flare.scale = size / camDistance;
                    flare.rotation = 0;
                    // flare.opacity = 1.0 - heatVisionValue;
                }
            }

            // lensflares
            var textureLoader = new THREE.TextureLoader();
            var textureFlare0 = textureLoader.load( 'https://s3plus.meituan.net/v1/mss_814dc1610cda4b2e8febd6ea2c809db5/distribute/28f3391f-ba4e-4cc4-85bf-2f6e4fa32537_1542252858133?filename=lensflare0.png' );
            var flareColor = new THREE.Color(0x80ff80);
            var textureFlare3 = textureLoader.load( 'https://s3plus.meituan.net/v1/mss_814dc1610cda4b2e8febd6ea2c809db5/distribute/8e58a264-6ae0-4f18-88f4-dc421a027e6b_1542252865862?filename=lensflare3.png' );
            var lensflare = new THREE.Lensflare();
            lensflare.addElement( new THREE.LensflareElement( textureFlare0, 32, 0, flareColor) );
            lensflare.addElement( new THREE.LensflareElement( textureFlare3, 16, 0, flareColor) );
            // lensFlare.customUpdateCallback = lensFlareUpdateCallback.bind(this);
            light.add( lensflare );

            // This time we give the sphere random x and y positions between -500 and 500
            light.position.x = Math.random() * 1000 - 500;
            light.position.y = Math.random() * 1000 - 500;

            // Then set the z position to where it is in the loop (distance of camera)
            light.position.z = z;

            // scale it up a bit
            light.scale.x = sphere.scale.y = 2;

            //add the sphere to the scene
            scene.add( light );

            //finally push it to the stars array
            stars.push(light);
        }
    }

    function animateStars() {

        // loop through each star
        for(var i=0; i<stars.length; i++) {

            star = stars[i];
            // console.log(star);

            // and move it forward dependent on the mouseY position.
            star.position.z +=  i/20;

            // if the particle is too close move it to the back
            if(star.position.z>1000) star.position.z-=2000;

        }

        if (circleScale > 3) {
            circleScale = 1;
        } else {
            circleScale +=0.05;
        }
        line.scale.set(circleScale, circleScale, circleScale);
        line1.scale.set(circleScale, circleScale, circleScale);

    }

    function render() {
        //get the frame
        requestAnimationFrame( render )
        //render the scene
        renderer.render( scene, camera );
        flyLine.tweenUpdate();
            // animateStars();

    }

    class FlyLine {
        constructor(data) {
            this.startPos = data.startPos;
            this.endPos = data.endPos;
            this.color = data.color;
            this.height = data.height;
            this.endPointIndex = 2;
            this.createFlyLine();
        }
        createFlyLine() {
            let middleCurvePositionX = (this.startPos.x + this.endPos.x) / 2;
            let middleCurvePositionY = this.height;
            let middleCurvePositionZ = (this.startPos.z + this.endPos.z) / 2;

            let curveData = new THREE.CatmullRomCurve3([
                this.startPos,
                new THREE.Vector3(middleCurvePositionX, middleCurvePositionY, middleCurvePositionZ),
                this.endPos
            ]);

            this.curveModelData = curveData.getPoints( 50 );
            this.geometry = new THREE.Geometry();
            this.geometry.vertices = this.curveModelData;
            for (let i = 0; i < this.geometry.vertices.length; i++) {
                this.geometry.colors[i] = new THREE.Color(
                    "hsl(120, " + (i * 50 + 50)+ "%, 48%)"
                );
            }
            this.material = new THREE.LineBasicMaterial({
                vertexColors: THREE.VertexColors,
                linewidth: 4,
            });
            this.curve = new THREE.Line(this.geometry, this.material);
            this.speed = (Math.random() + 0.1) * 0.0002;

            this.index = {
                endPointIndex: 2,
            };
            this.tween = new TWEEN.Tween(this.index)
            .to({endPointIndex: 50}, 3000)

            this.tween.onUpdate(this.update.bind(this))


            this.tween.start()
        }
        tweenUpdate() {
            TWEEN.update();
        }
        update() {
            this.endPointIndex = Math.ceil(this.index.endPointIndex);
            let data = this.curveModelData.slice(0, this.endPointIndex);

            if (data.length > 10) {
                data = data.slice(-10);
            }
            let curvePartialData = new THREE.CatmullRomCurve3(data);
            if (!curvePartialData.points.length) {
                return;
            }

            this.curve.geometry.vertices = curvePartialData.getPoints(50);
            for (let i = 0; i < this.curve.geometry.vertices.length; i++) {
                this.curve.geometry.colors[i] = new THREE.Color(
                    "hsl(120, " + (i * 50 + 50)+ "%, 48%)"
                );
            }
            this.curve.geometry.verticesNeedUpdate = true;
            this.curve.geometry.colorsNeedUpdate = true;
        }

    }


    init();
    // addSphere();
    render();
