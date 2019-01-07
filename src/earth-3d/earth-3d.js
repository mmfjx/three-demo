import Shaders from './shaders.js';
import Utils from './utils.js';
import locations from './locations.js';
import countries from './countries.js';
import stationB from './earth/station_b.js';
import stationC from './earth/station_c.js';
import PlanetLocations from './PlanetLocations.js';
import PlanetPointed from './PlanetPointed.js';
import PlanetContour from './PlanetContour.js';
import ProjectiveImage from './ProjectiveImage.js';

export default class Earth {
    constructor(renderer, scene, camera) {
        this.renderer = renderer;
        this.scene = scene;
        this.camera = camera;
        this.planet();
    }
    planet() {
        let data = {
            locations,
            countries,
        };
        let radius = this.radius = 10; // Radius used to calculate position of tiles
        let ratio = this.ratio = window.devicePixelRatio || 1;

        // PLANET 3D CONTAINER 地球
        let container = this.container = window.earthContainer = new THREE.Object3D();
        this.scene.add(container);
        let scaleNum = 10;
        container.scale.set(scaleNum, scaleNum, scaleNum);

        // 3D CONTAINER FOR OBJECTS LOOKING TO THE CAMERA
        let static_container = this.static_container = new THREE.Object3D();
        this.scene.add(static_container);
        static_container.matrixAutoUpdate = false;

        this.textureLoader = new THREE.TextureLoader();

        this.planet_color = 0xa6f5a3;
        // this.planet_color = 0x00b0f2;

        this.water_color = 0xa6f5a3; // 0x81915b;

        this.data = data;

        // sort countries by id
        data.countries_by_id = {};
        for (let i = 0; i < data.countries.length; i++) {
            let l = data.countries[i];
            data.countries_by_id[l.country_id] = l;
        }

        // sort locations by id
        data.locations_by_id = {};
        for (let i = 0; i < data.locations.length; i++) {
            let l = data.locations[i];
            data.locations_by_id[l.location_id] = l;
        }

        this.planetData();

        // this.drawPoints(radius * 1.1);
        // this.drawParticles(radius * 1.3);
        // this.drawOrbitas();

        this.planetLocations = new PlanetLocations(this);
        // this.planetPointed = new PlanetPointed(this);
        // this.planetContour = new PlanetContour(this);

        console.log('camera', this.camera);

        // INIT THE PLANET
        let _first_year = '2050';
        this.showYear(_first_year);
    }

    showYear(_year) {
        // debugger;
        if (this.YEAR_ID) {
            return;
        }

        this.YEAR_ID = _year;
        this.YEAR = this.years[_year];
        if (!this.YEAR.earth_image) {
            this.YEAR.earth_image = this.projectiveImage = new ProjectiveImage(this.YEAR.earth_url, this.show.bind(this));
        }


    }
    show() {
        this.planetLocations.show(this.YEAR_ID);
        // this.planetContour.show(this.YEAR_ID);
        this.textureLoader.load('./earth/snowflake7_alpha.png', (texture) => {
            texture.generateMipalphaMaps = false;
            texture.magFilter = THREE.LinearFilter;
            texture.minFilter = THREE.LinearFilter;
            // this.planetPointed.show(this.YEAR_ID, texture);
        });
        this.textureLoader.load('./earth/gold.png', (texture) => {
            // this.drawGoldParticles(this.radius, texture);
        });

    }
    googlePosToUV(_u, _v) {
        if (_u === undefined) {
            let a = ('40.705565,-74.1180857').split(',');
            _u = a[0];
            _v = a[1];
        }
        let u = 1 - (parseFloat(_u) + 90) / 180;
        u += 0.014;
        if (u > 1) {
            u = u - 1;
        }
        let v = (parseFloat(_v) + 180) / 360;
        v -= 0.031;
        if (v < 0) {
            v = 1 + v;
        }
        return { u: u, v: v };
    }

    drawPoints(radius) {
        this.grid_shpere = new THREE.Object3D();
        // XRAY EARTH
        let _geometry = new THREE.SphereGeometry(radius * 1.1, 66, 44);

        let _material = Shaders.XRayMaterial({
            map: this.textureLoader.load('./earth/clouds.jpg'),
            alphaProportion: .5,
            // color: new THREE.Color(0xfb2f2c5),
            color: new THREE.Color(this.planet_color),
            opacity: 1,
            gridOffsetSpeed: .6
        });

        var clouds_mesh = new THREE.Mesh(_geometry, _material);
        clouds_mesh.matrixAutoUpdate = false;
        this.clouds_mesh = clouds_mesh;
        this.container.add(clouds_mesh);
    }
    drawParticles(radius) {
        var total = 600;
        var positions = new Float32Array(total * 3);
        // var color = new THREE.Color(0xfb2f2c5);
        let color = new THREE.Color(this.planet_color);
        var spherical = new THREE.Spherical();
        var vec3 = new THREE.Vector3();

        // ADDITIVE POINTS
        for (var i = 0; i < total; i++) {
            var ii = i * 3;
            spherical.radius = radius * (1 + Math.random() * .6);
            spherical.theta = Math.random() * 8;
            spherical.phi = .3 + Math.random() * 2.2;
            vec3.setFromSpherical(spherical);

            positions[ii] = vec3.x;
            positions[ii + 1] = vec3.y;
            positions[ii + 2] = vec3.z;
        }

        var geometry = new THREE.BufferGeometry();
        geometry.addAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.computeBoundingSphere();

        var material = new THREE.PointsMaterial();
        // material.size = .1 / this.ratio;
        material.size = 5;
        material.color = color;
        material.transparent = true;
        material.opacity = 0.8;
        material.blending = THREE.AdditiveBlending;
        material.depthWrite = false;


        let particles = new THREE.Points(geometry, material);
        // particles.matrixAutoUpdate = false;
        this.particles = particles;
        this.container.add(particles);
    }

    /**
     * 金色粒子
     * @param {*} radius
     * @param {*} texture
     */
    drawGoldParticles(radius, texture) {
        let step = 400;
        let positions = [];
        let spherical = new THREE.Spherical();
        spherical.radius = radius;
        let vec3 = new THREE.Vector3();
        let projectiveImage = this.years[this.YEAR_ID].earth_image;
        // ADDITIVE POINTS
        for (let i = 0; i < step; i++) {
            for (let j = 0; j < step; j++) {
                let u = Math.random();
                let v = Math.random();
                let is_land = projectiveImage.isLandByUV(u, v);
                if (is_land) {
                    spherical.theta = u * Math.PI * 2 - Math.PI / 2;
                    spherical.phi = v * Math.PI;
                    vec3.setFromSpherical(spherical);
                    positions.push(vec3.x);
                    positions.push(vec3.y);
                    positions.push(vec3.z);
                }
            }
        }
        let positions3 = new Float32Array(positions.length);
        for (let j = 0; j < positions.length; j++) {
            positions3[j] = positions[j];
        }

        let geometry = new THREE.BufferGeometry();
        geometry.addAttribute('position', new THREE.BufferAttribute(positions3, 3));
        geometry.computeBoundingSphere();

        let material = new THREE.PointsMaterial();
        material.size = 4;
        material.map = texture;
        material.depthWrite = false;


        let goldParticles = new THREE.Points(geometry, material);
        goldParticles.matrixAutoUpdate = false;
        this.container.add(goldParticles);
        this.goldParticles = goldParticles;
        this.goldParticles.visible = false;
    }
    drawRing(params) {
        let position = params.position;
        let radius = params.radius;
        let width = params.width;
        let dont_orient = params.dont_orient;
        let rotation = params.rotation;
        let container = params.container;

        let geometry = new THREE.RingGeometry(radius, radius + width, 64, 1);
        let m = new THREE.Matrix4();
        if (!dont_orient) {
            m.makeRotationX(Math.PI / 2);
        } else {
            m.setPosition(new THREE.Vector3(0, 0, radius * 0.29));
        }
        geometry.applyMatrix(m);

        let material = new THREE.MeshBasicMaterial({ color: this.planet_color, side: THREE.DoubleSide });
        material.transparent = true;
        material.opacity = Math.random() * 0.2 + 0.1;
        material.blending = THREE.AdditiveBlending;
        material.depthWrite = false;
        let cylinder = new THREE.Mesh(geometry, material);
        cylinder.rotation.set(rotation.x, rotation.y, rotation.z);
        cylinder.position.set(position.x, position.y, position.z);

        container.add(cylinder);
        return cylinder;
    }
    addSputnik(name, radius, container, rotation) {
        let loader = new THREE.JSONLoader();
        let ringParams = {
            position: new THREE.Vector3(),
            radius: radius,
            width: 0.05,
            rotation: new THREE.Vector3(),
            container: this.scene,
        };
        this.ring = this.drawRing(ringParams);
        this.ring.material.opacity = 0.3;
        let obj = loader.parse(name);
        let material = new THREE.MeshBasicMaterial({ color: this.planet_color });
        material.wireframe = true;

        // let object = new THREE.Mesh(obj.geometry, obj.material);
        let object = new THREE.Mesh(obj.geometry, material);
        object.position.x = -radius;
        object.rotation.x = 0.5;
        object.scale.set(0.03, 0.03, 0.03);
        object.matrixAutoUpdate = false;
        object.updateMatrix();
        this.ring.add(object);
        this.sputniks.push(this.ring);

        let ring_container = new THREE.Object3D();
        container.add(ring_container);
        ring_container.add(this.ring);

        ring_container.rotation.x = rotation.x;
        ring_container.rotation.y = rotation.y;
        ring_container.rotation.z = rotation.z;

        ring_container.matrixAutoUpdate = false;
        ring_container.updateMatrix();

        return this.ring;
    }
    drawSputniks() {
        this.sputniks = [];
        this.addSputnik(stationB, this.radius * 1.2, this.container, new THREE.Vector3(-0.5, 0, 0));
        this.addSputnik(stationC, this.radius * 1.25, this.container, new THREE.Vector3(0.6, 3, -1.2));
    }
    drawOrbitas() {
        this.orbits = [];

        for (let i = 0; i < this.radius; i += 3) {
            let position = new THREE.Vector3(0, i, 0);
            let p = Math.cos(position.y / this.radius);
            p += Math.random() > 0.8 ? Math.random() * 0.7 : Math.random() * 0.2;
            var rotation = new THREE.Vector3(Math.random() * Math.PI, 0, Math.random() * Math.PI);
            position.y = 0;
            let ringParams = {
                position: position,
                radius: this.radius * 1.1,
                width: Math.random() * 0.05 + 0.02,
                rotation: rotation,
                container: this.container,
            };
            let orbit = this.drawRing(ringParams);
            let speed_x = Utils.getRandSides(0.002);
            let speed_y = Utils.getRandSides(0.002);
            let speed_z = Utils.getRandSides(0.002);
            orbit._increment = new THREE.Vector3(speed_x, speed_y, speed_z);
            this.orbits.push(orbit);
        }
    }

    planetData() {
        this.YEAR = null; // Current YEAR data container
        this.YEAR_ID = null; // Current year id container

        // YEARS DATA
        this.years = {
            2050: {
                'earth_url': './earth/earth_1.png',
                'contour_url': ['./earth/contour1_1.png', './earth/contour2_1.png'],
                min_locations: 10
            }
        };


        //
        this.year_ids = [];
        for (var i in this.years) {
            this.year_ids.push(i);
        }
    }

    changeColor(color) {
        // this.planetContour.changeColor(color);
        this.particles.material.color.setHex(color);
        this.orbits.forEach((o) => {
            o.material.color.setHex(color);
        });
    }
    setVisible(visible) {
        this.planetContour.setVisible(visible);
        this.clouds_mesh.visible = visible;
    }
    update() {

        this.camera_dist_to_center = this.camera.position.distanceToSquared(new THREE.Vector3()) - 100;

        // this.static_container.lookAt(this.camera.getWorldPosition());
        // this.static_container.updateMatrix();

        // MOVEMENT OF DECOR ORBITS
        if (this.orbits) {
            for (let i = 0; i < this.orbits.length; i++) {
                let orbit = this.orbits[i];
                orbit.rotation.x += orbit._increment.x;
                orbit.rotation.y += orbit._increment.y;
                orbit.rotation.z += orbit._increment.z;
            }
        }

        // Movement of space stations
        if (this.sputniks) {
            for (let i = 0; i < this.sputniks.length; i++) {
                var sputnik = this.sputniks[i];
                sputnik.rotation.y += 0.0020;
            }
        }

        // PLANET LANDSCAPE MADE OF POINTS
        if (this.planetPointed) {
            this.planetPointed.update();
        }
    }
}
