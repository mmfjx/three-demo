export default class PlanetContour {
    constructor(planet) {
        this.planet = planet;

        this._geometry = new THREE.SphereGeometry(planet.radius, 32, 32, 0, Math.PI);
        var m1 = new THREE.MeshBasicMaterial();
        m1.color = new THREE.Color(planet.planet_color);
        m1.fog = false;
        m1.opacity = 0.6;
        m1.transparent = true;
        m1.blending = THREE.AdditiveBlending;
        m1.depthWrite = false;
        this.m1 = m1;

        this.sphere1 = new THREE.Mesh(this._geometry, m1);
        this.sphere1.visible = false;
        this.sphere1.matrixAutoUpdate = false;
        this.sphere1.updateMatrix();
        planet.container.add(this.sphere1);
        this.sphere1.matrixAutoUpdate = false;

        // 2nd halfsphere
        var m2 = m1.clone();
        this.m2 = m2;

        var sphere2 = this.sphere1.clone();
        sphere2.material = m2;
        planet.container.add(sphere2);
        sphere2.rotation.y = Math.PI;
        sphere2.updateMatrix();
        this.sphere2 = sphere2;
    }


    // METHODS

    show(_year) {
        var year_data = this.planet.years[_year];

        if (!year_data.contour_texture) {
            this.planet.years[this.planet.YEAR_ID].contour_texture = [];
            let urls = year_data.contour_url;
            this.getTexture(urls[0]).then((map) => {
                this.planet.years[this.planet.YEAR_ID].contour_texture[0] = map;
                this.updateMap(this.m1, map);
                this.sphere1.visible = true;

            });
            this.getTexture(urls[1]).then((map) => {
                this.planet.years[this.planet.YEAR_ID].contour_texture[1] = map;
                this.updateMap(this.m2, map);
                this.sphere2.visible = true;

            });
        }


    }
    updateMap(material, map) {
        material.map = map;
        material.map.generateMipalphaMaps = false;
        material.map.magFilter = THREE.LinearFilter;
        material.map.minFilter = THREE.LinearFilter;
        material.needsUpdate = true;
    }

    getTexture(path) {
        return new Promise((resolve, reject) => {
            this.planet.textureLoader.load(path, (map) => {
                map.generateMipalphaMaps = false;
                map.magFilter = THREE.LinearFilter;
                map.minFilter = THREE.LinearFilter;
                resolve(map);
            }, ()=> {
                console.error('纹理图片加载失败！');
            } );
        });

    }

    changeColor(color) {
        this.sphere1.material.color.setHex(color);
        this.sphere2.material.color.setHex(color);
    }

    setVisible(visible) {
        this.sphere1.visible = visible;
        this.sphere2.visible = visible;
    }
}
