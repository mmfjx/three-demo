import Shaders from './shaders.js';
import Utils from './utils.js';
import PlanetPointed from './PlanetPointed.js';
import PlanetContour from './PlanetContour.js';
import ProjectiveImage from './ProjectiveImage.js';

export default class Earth {
    constructor(renderer, scene, camera, theme) {
        this.renderer = renderer;
        this.scene = scene;
        this.camera = camera;
        this.theme = theme;
        this.planet();
    }
    planet() {
        let radius = this.radius = 10; // Radius used to calculate position of tiles
        let ratio = this.ratio = window.devicePixelRatio || 1;

        // PLANET 3D CONTAINER 地球
        let container = this.container = new THREE.Object3D();
        this.scene.add(container);

        // let winRadius = window.innerHeight < window.innerWidth ? window.innerHeight / 2 : window.innerWidth / 2;
        // console.log(winRadius, 'xxxx');
        let vFOV = THREE.Math.degToRad( this.camera.fov ); // convert vertical fov to radians
        let height = 2 * Math.tan( vFOV / 2 ) * this.camera.position.z / 2;
        let scaleNum = height / radius;
        this.scaleNum = scaleNum;
        container.scale.set(scaleNum, scaleNum, scaleNum);
        // this.camera.position.z = 1200;

        this.textureLoader = new THREE.TextureLoader();
        // this.planet_color = colorUtil.colorStr2Hex(`#${window.$qsObj.color}`) || 0x00b0f2;
        this.planet_color =  0x00b0f2;
        this.planetData();

        this.drawPoints(radius * 1.1);
        this.drawParticles(radius * 1.3);
        this.drawOrbitas();

        this.planetPointed = new PlanetPointed(this);
        this.planetContour = new PlanetContour(this);

        console.log('camera', this.camera);

        // INIT THE PLANET
        let _first_year = '2050';
        this.showYear(_first_year);
    }

    showYear(_year) {
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
        this.planetContour.show(this.YEAR_ID);
        this.textureLoader.load('./3d/snowflake7_alpha.png', (texture) => {
            texture.generateMipalphaMaps = false;
            texture.magFilter = THREE.LinearFilter;
            texture.minFilter = THREE.LinearFilter;
            this.planetPointed.show(this.YEAR_ID, texture);
        });
        this.drawGoldParticles(this.radius);

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

    // 透明球罩
    drawPoints(radius) {
        this.grid_shpere = new THREE.Object3D();
        // XRAY EARTH
        let _geometry = new THREE.SphereGeometry(radius * 1.1, 66, 44);

        let _material = Shaders.XRayMaterial({
            map: this.textureLoader.load('./3d/clouds.jpg'),
            alphaProportion: 0.5,
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
        material.size = 1;
        material.color = color;
        material.transparent = true;
        material.opacity = 0.8;
        material.blending = THREE.AdditiveBlending;
        material.depthWrite = false;


        let particles = new THREE.Points(geometry, material);
        this.particles = particles;
        this.container.add(particles);
    }

    /**
     * 金色粒子
     * @param {*} radius
     *
     */
    drawGoldParticles(radius) {
        let step = 500;
        let positions = [];
        let spherical = new THREE.Spherical();
        spherical.radius = radius;
        let vec3 = new THREE.Vector3();
        let projectiveImage = this.years[this.YEAR_ID].earth_image;
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
        geometry.addAttribute('initialPosition', new THREE.BufferAttribute(positions3, 3).clone());
        geometry.computeBoundingSphere();
        geometry.attributes.position.setDynamic( true );
        let material = new THREE.PointsMaterial();
        material.size = 4;
        // material.color = new THREE.Color(0xefdb6a);
        material.color = new THREE.Color(0xefdb6a);
        // material.map = goldTexture;
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
                'earth_url': './3d/earth.960_480.jpg',
                'contour_url': ['./3d/contour.jpg'],
            }
        };

        this.year_ids = [];
        for (var i in this.years) {
            this.year_ids.push(i);
        }
    }

    changeColor(color) {
        this.planetContour.changeColor(color);
        this.particles.material.color.setHex(color);
        this.orbits.forEach((o) => {
            o.material.color.setHex(color);
        });
    }
    setVisible(visible) {
        this.planetContour.setVisible(visible);
        this.clouds_mesh.visible = visible;
    }

    setPointedVisible(visible) {
        this.planetPointed.setVisible(visible);
        this.particles.visible = visible;
        this.orbits.forEach((o) => {
            o.visible = visible;
        });

    }
    update() {

        this.camera_dist_to_center = this.camera.position.distanceToSquared(new THREE.Vector3()) - 100;

        // MOVEMENT OF DECOR ORBITS
        if (this.orbits) {
            for (let i = 0; i < this.orbits.length; i++) {
                let orbit = this.orbits[i];
                orbit.rotation.x += orbit._increment.x;
                orbit.rotation.y += orbit._increment.y;
                orbit.rotation.z += orbit._increment.z;
            }
        }
        // PLANET LANDSCAPE MADE OF POINTS
        if (this.planetPointed) {
            this.planetPointed.update();
        }
    }
    depose() {
        this.planetContour = null;
        this.planetPointed = null;
    }
}
//