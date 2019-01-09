// 两种方式，一是自己写公式计算位置，二是使用球体模型

export default class PointSphere {
    constructor(data) {
        this.radius = data.radius || 100;
        this.maxParticles = data.maxParticles || 1000;
        this.elapsed = 0;
        this.camera = data.camera;
        this.groupObject = new THREE.Object3D();
        this.init();
    }
    createPoints() {
        this.sphereGeometry = new THREE.Geometry();
        let particlesDelay = 1;
        let radius = this.radius;
        for ( let i = 0; i < this.maxParticles; i++ ) {
            let p = Math.random();
            let t = Math.random();
            let x = radius * Math.sin(Math.PI * p) * Math.cos(Math.PI * t * 2);
            let y = radius * Math.sin(Math.PI * p) * Math.sin(Math.PI * t * 2);
            let z = radius * Math.cos(Math.PI * p);
            let vertex = new THREE.Vector3(x, y, z);


            vertex.rotationAxis = new THREE.Vector3(0, Math.random() * 2 - 1, Math.random() * 2 - 1);
            vertex.rotationAxis.normalize();
            vertex.delay = particlesDelay * i;
            this.sphereGeometry.vertices.push(vertex);
        }

    }

    createSortSphere() {
        this.sortSphereGeo = new THREE.Geometry();
        let t_grid = 50;
        let s_grid = 50;
        let spherical = new THREE.Spherical();
        spherical.radius = 100;
        for(let s = 0; s < s_grid; s++ ) { // 竖条 经度
            let st = (1-Math.sin(s / s_grid * Math.PI)) + 0.5; // 南北两极点横条多，中间稀疏  grapher y=({1-sin({ |_frac_{{x};{ 50}} * π})}) + 0.5
            // let st = (1 - Math.sin(s / step * Math.PI));
            // let st = s + 0.5;
            for (let t = 0; t < t_grid; t += st) { // 横条 纬度
                let u = s / s_grid;
                let v = t / t_grid;
                spherical.theta = u * Math.PI * 2;
                spherical.phi = v * Math.PI;
                let pos = new THREE.Vector3();
                pos.setFromSpherical(spherical);
                this.sortSphereGeo.vertices.push(pos);
            }
        }
    }
    createMaterial() {
        this.material = new THREE.PointsMaterial({
            color: 0x00D8C6,
            size: 1,
            transparent: true,
            opacity: 1,
            blending: THREE.AdditiveBlending,
        });
    }

    init() {
        this.createPoints();
        this.createMaterial();
        this.createSortSphere();
        this.sphere = new THREE.Points(this.sphereGeometry, this.material);
        this.sphere.position.x = -120;
        this.sortSphere = new THREE.Points(this.sortSphereGeo, this.material.clone());
        this.sortSphere.position.x = 120;
        this.sortSphere.material.color = new THREE.Color(0xff00ff);
        this.groupObject.add(this.sphere);
        this.groupObject.add(this.sortSphere);
    }
    update() {
        // this.elapsed++;
        // for ( let i = 0; i < this.maxParticles; i++ ) {

        //     let particle = this.sphereGeometry.vertices[i];

        //     if ( this.elapsed > particle.delay ) {
        //         particle.applyAxisAngle(particle.rotationAxis, 0.008);
        //     }
        // }
        // this.sphere.geometry.verticesNeedUpdate = true;
    }
}


