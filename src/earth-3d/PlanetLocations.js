import Utils from './utils.js';

export default class PlanetLocations {
    constructor(planet) {
        this.planet = planet;
        this.data = planet.data;
        this.data_locations = this.data.locations;
        this.current_container;

        this.current_locations; // a list of locations corresponding to the current year

        this.max_opacity = .8;
        this.material_yellow = window.material_yellow = new THREE.MeshBasicMaterial({
            transparent: true,
            opacity: 1,
            color: new THREE.Color(0xffde00),
            blending: THREE.AdditiveBlending,
            side: THREE.DoubleSide,
            depthWrite: false
        });

        this.material_white = new THREE.MeshBasicMaterial({
            transparent: true,
            opacity: 1,
            color: new THREE.Color(0xffffff),
            blending: THREE.AdditiveBlending,
            side: THREE.DoubleSide,
            depthWrite: false,
        });
        this.f_images = [];
        for (let i = 0; i < this.data_locations.length; i++) {
            this.f_images.push(this.data_locations[i].preview);
        }
        this.hex = Utils.createHexagon(.2, false, undefined); //六边形网格
        this.hex_ring = Utils.createHexagon(.25, false, undefined, .02); //网格边框
        this.hex.add(this.hex_ring);
        console.log(this.hex )

        this.r = planet.radius * 1.005;
        this.zero = new THREE.Vector3();
        this._light_material = new THREE.MeshBasicMaterial({
            transparent: true,
            opacity: .9,
            blending: THREE.AdditiveBlending,
            side: THREE.DoubleSide,
            depthWrite: false,
            fog: true
        });
        var m = this._light_material;
        m.map = planet.textureLoader.load('./earth/lightray.jpg');
        m.map.wrapT = THREE.ClampToEdgeWrapping;


        this._light_material_yellow = this._light_material.clone();
        this._light_material_yellow.map = planet.textureLoader.load('./earth/lightray_yellow.jpg');

    }

    // METHODS

    init(_year) {
        var container = new THREE.Object3D();
        container.matrixAutoUpdate = false;

        var _locations = container._locations = [];
        for (let i = 0; i < this.data_locations.length; i++) {
            let l = this.data_locations[i];
            _locations.push(l); /// All Locations are available in all Years
        }

        var geo;
        var geo_yellow = new THREE.Geometry(); //hex.geometry.clone();
        var geo_white = new THREE.Geometry(); //hex.geometry.clone();

        for (let i = 0; i < _locations.length; i++) {

            var l = _locations[i];
            var l_year_data = l.years[_year];

            if (!l_year_data.briefs) continue;
            l.country = this.data.countries_by_id[l.country_id];

            var uv = this.planet.googlePosToUV(l.planet_u, l.planet_v);
            Utils.setFromSpherical(this.r, uv.v, uv.u, this.hex.position);
            this.hex.lookAt(new THREE.Vector3(0, 0, 0));
            this.hex.updateMatrix();
            this.hex.updateMatrixWorld();

            geo = l_year_data.works ? geo_yellow : geo_white;
            geo.merge(this.hex.geometry, this.hex.matrixWorld);
            geo.merge(this.hex_ring.geometry, this.hex_ring.matrixWorld);

            // l.position = this.hex.position.clone();

            // and finaly the ray 光柱
            // l.light = this.addLightRay(this.hex.position, l_year_data.works);
            // container.add(l.light);

        }

        // 黄色图标
        var hexs_yellow = new THREE.Mesh(geo_yellow, this.material_yellow);
        container.add(hexs_yellow);

        // 白色图标
        var hexs_white = new THREE.Mesh(geo_white, this.material_white);
        container.add(hexs_white);

        return container;
    }

    show(_year) {
        var year_data = this.planet.years[_year];

        if (!year_data.locations_container) {
            year_data.locations_container = this.init(_year);
        }
        this.current_container = window.current_container = year_data.locations_container;
        this.current_locations = this.current_container._locations;

        this.planet.container.add(current_container);
    }

    addLightRay(_pos, has_works) {

        var h = Math.random() * 2 + 1;
        var geometry = new THREE.PlaneBufferGeometry(0.3, h, 1);
        // var material = new THREE.MeshBasicMaterial( {color: 0xffffff, side: THREE.DoubleSide} );
        var plane = new THREE.Mesh(geometry, has_works ? this._light_material_yellow : this._light_material);
        var m = new THREE.Matrix4();
        m.makeRotationX(Math.PI / 2);
        m.setPosition(new THREE.Vector3(0, 0, -h / 2));
        geometry.applyMatrix(m);

        // cross plane of ray
        var plane2 = plane.clone();
        plane.add(plane2);
        plane2.rotation.z = Math.PI / 2;
        plane2.matrixAutoUpdate = false;
        plane2.updateMatrix();

        // main ray plane
        plane.position.copy(_pos);
        plane.lookAt(this.planet.container.position);
        // console.log( '>', plane.rotation );
        plane.matrixAutoUpdate = false;
        plane.updateMatrix();

        return plane;
    }

}
