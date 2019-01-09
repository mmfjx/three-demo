export default class LightRing {
    constructor(data) {
        this.texture = data.texture;
        this.innerRadius = data.innerRadius || 400;
        this.ringLight = null;
        this.ringScale = 1;
        this.init();
    }


    init() {
    // shadow
        var canvas = document.createElement( 'canvas' );
        canvas.width = 64;
        canvas.height = 64;
        var context = canvas.getContext( '2d' );
        /*
        径向渐变
        context.createRadialGradient(x0,y0,r0,x1,y1,r1);
        x0	渐变的开始圆的 x 坐标
        y0	渐变的开始圆的 y 坐标
        r0	开始圆的半径
        x1	渐变的结束圆的 x 坐标
        y1	渐变的结束圆的 y 坐标
        r1	结束圆的半径
        */
        var gradient = context.createRadialGradient(
            canvas.width / 2,
            canvas.height / 2,
            0,
            canvas.width / 2,
            canvas.height / 2,
            canvas.width / 2
        );
        gradient.addColorStop( 0, tinycolor('rgba(250,250,210,0.4)'));
        gradient.addColorStop( 0.4, tinycolor('rgba(200,254,214,0.1)'));
        gradient.addColorStop( 0.5, tinycolor('rgba(200,254,214,1)'));
        // gradient.addColorStop( 0.5, 'green');

        gradient.addColorStop( 0.6, tinycolor('rgba(200,254,214,0.1)'));
        gradient.addColorStop( 1, tinycolor('rgba(250,250,210,0))'));
        context.fillStyle = gradient;
        context.fillRect( 0, 0, canvas.width, canvas.height );
        //画布纹理，使用画布初始化某个纹理
        var texture = new THREE.CanvasTexture( canvas );

        // in this example we create the material when the texture is loaded
        let geometry = new THREE.RingGeometry(10, 64, 64, 32);
        let material = new THREE.MeshBasicMaterial({
            map: this.texture || texture,
            // map: texture,
            wireframe: true,
            wireframeLinewidth: 0.1,
            transparent: true,
            side: THREE.DoubleSide,
            opacity: 0.8,
        });

        let ring = new THREE.Mesh(geometry, material);
        ring.rotateX(30);
        this.ringLight = ring;
    }

    update() {

        if (this.curveLine) {
            this.curveLine.rotation.y += 0.001;
            this.curveLine.rotation.z += 0.001;
            this.curveLine1.rotation.y -= 0.001;
            this.curveLine1.rotation.z -= 0.001;
        }
        // if (this.sRingLight) {
        //     this.sRingLight.scale.set(this.sRingScale, this.sRingScale, this.sRingScale);
        // }
        if (this.ringLight) {
            if (this.ringScale > 2) {
                this.ringScale = 1;
            } else {
                this.ringScale += 0.01;
            }
            this.ringLight.scale.set(this.ringScale, this.ringScale, this.ringScale);
        }
    }

}


