import Utils from './utils.js';

export default class PlanetPointed {
    constructor(planet) {
        this.planet = planet;
        /// INIT
        var parts_count = 2;
        var u_grid = 200;
        var v_grid = 200;
        // var u_grid = 150;
        // var v_grid = 150;
        this.materials = [];
        for (let i = 0; i < parts_count; i++) {
            // var m = new THREE.PointsMaterial({ size: 8 });
            var m = new THREE.PointsMaterial({ size: 10 });
            m.color = new THREE.Color(planet.planet_color);

            m.depthWrite = false;
            m.transparent = true;
            m.opacity = 0.8;
            m.blending = THREE.AdditiveBlending;
            // m.side = THREE.BackSide;//FrontSide
            this.materials.push(m);
        }

        this.current_container;
        this.sea_hex_material;
        this.parts_count = parts_count;
        this.v_grid = v_grid;
        this.u_grid = u_grid;
    }


    // METHODS
    init(_year, texture) {
        for (let i = 0; i < this.materials.length; i++) {
            this.materials[i].map = texture;
            this.materials[i].needsUpdate = true;
        }
        var container = new THREE.Object3D();
        container.matrixAutoUpdate = false;
        var sphere_parts = [];

        for (var i = 0; i < this.parts_count; i++) {
            sphere_parts[i] = {
                positions: [],
            };
        }

        // 球体坐标系
        let spherical = new THREE.Spherical();
        spherical.radius = this.planet.radius;
        var pos = new THREE.Vector3();
        var projectiveImage = this.planet.years[_year].earth_image;

        // debugger;
        for (var sv = 0; sv < this.v_grid; sv++) { // 经度
            var st = (this.u_grid * (1 - Math.sin(sv / this.v_grid * Math.PI))) / this.u_grid + 0.5;
            // var st = (1 - Math.sin(sv / this.v_grid * Math.PI)) + 0.5;

            for (var su = 0; su < this.u_grid; su += st) { // 纬度 南北两极点密集，中间稀疏
                // var u = su / this.u_grid;
                // var v = sv / this.v_grid;
                var u = Math.random();
                var v = Math.random();
                var is_land = projectiveImage.isLandByUV(u, v);
                if (is_land) {
                    var obj = sphere_parts[Math.floor(Math.random() * this.parts_count)];
                    spherical.theta = u * Math.PI * 2 - Math.PI / 2;
                    spherical.phi = v * Math.PI;
                    pos.setFromSpherical(spherical);
                    obj.positions.push(pos.x);
                    obj.positions.push(pos.y);
                    obj.positions.push(pos.z);
                }
            }
        }
        // // POINTS
        for (let i = 0; i < sphere_parts.length; i++) {
            var o = sphere_parts[i];
            var geometry = new THREE.BufferGeometry();

            var positions_ = new Float32Array(o.positions.length);
            for (var j = 0; j < o.positions.length; j++) {
                positions_[j] = o.positions[j];
            }

            geometry.addAttribute('position', new THREE.BufferAttribute(positions_, 3));
            geometry.computeBoundingSphere();

            o.material = this.materials[i];
            // var material = new THREE.MeshBasicMaterial( { color: 0xff0000 } );
            var points = o.mesh = new THREE.Points(geometry, o.material);
            points.matrixAutoUpdate = false;
            container.add(points);
        }
        return container;
    }

    update() {
        // for (var i = 0; i < this.materials.length; i++) {
        //     var m = this.materials[i];
        //     m.t_ += m.speed_;
        //     // o.material.opacity = Math.sin(o.t)*.2+.5;
        //     m.opacity = (Math.sin(m.t_) * m.delta_ + m.min_) * m.opacity_coef_;
        // }
    }


    show(_year, texture) {
        var year_data = this.planet.years[_year];

        if (!year_data.pointed_sphere) {
            year_data.pointed_sphere = this.init(_year, texture);
        }
        this.current_container = year_data.pointed_sphere;

        this.planet.container.add(this.current_container);
    }
}
