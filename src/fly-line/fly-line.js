export default class FlyLine {
    constructor(data) {
        if (Array.isArray(data.points)) {
            this.points = data.points;
        } else {
            this.startPos = data.startPos;
            this.endPos = data.endPos;
            // 中间点的高度
            this.height = data.height;
        }
        this.color = tinycolor(data.color || 'D4D89B').toHsl();
        this.flyTime = data.flyTime || 2000;
        this.noContinuous = data.noContinuous || false; // 是否是连续飞线
        this.shortLineLength = data.shortLineLength || 10; // 非连续线段的飞线长度

        this.createFlyLine();
    }
    createFlyLine() {
        let curveData = null;
        if (this.points && this.points.length) {
            // 创建3d样本曲线
            curveData = new THREE.CatmullRomCurve3(this.points);
        } else {
            let middleCurvePositionX = (this.startPos.x + this.endPos.x) / 2;
            let middleCurvePositionY = this.height;
            let middleCurvePositionZ = (this.startPos.z + this.endPos.z) / 2;

            curveData = new THREE.CatmullRomCurve3([
                this.startPos,
                new THREE.Vector3(middleCurvePositionX, middleCurvePositionY, middleCurvePositionZ),
                this.endPos
            ]);
        }

        this.curveModelData = curveData.getPoints( 50 );
        this.geometry = new THREE.Geometry();
        this.geometry.vertices = this.curveModelData;
        // 设置渐变色
        for (let i = 0; i < this.geometry.vertices.length; i++) {
            this.geometry.colors[i] = new THREE.Color(
                // `hsl(120, ${i / this.geometry.vertices.length * 100}%, 48%)`
                `hsl(${Math.ceil(this.color.h)}, ${Math.ceil(i / this.geometry.vertices.length * 100)}%, ${Math.ceil(this.color.l * 100)}%)`
            );
        }
        this.material = new THREE.LineBasicMaterial({
            vertexColors: THREE.VertexColors,
        });
        this.curve = new THREE.Line(this.geometry, this.material);

        this.index = {
            endPointIndex: 2,
        };
        this.tween = new TWEEN.Tween(this.index)
            .to({endPointIndex: 50}, this.flyTime)
            .repeat( Infinity )
            .delay( 1000 )
            .onUpdate(this.tweenUpdate.bind(this))
            .start();
    }
    tweenUpdate() {
        this.endPointIndex = Math.ceil(this.index.endPointIndex);
        let curveData = this.curveModelData.slice(0, this.endPointIndex);
        if (this.noContinuous && curveData.length > this.shortLineLength) {
            curveData = curveData.slice(-this.shortLineLength);
        }
        let curvePartialData = new THREE.CatmullRomCurve3(curveData);
        if (!curvePartialData.points.length) {
            return;
        }
        // this.curve.geometry.vertices = curveData;
        this.curve.geometry.vertices = curvePartialData.getPoints(50);
        for (let i = 0; i < this.curve.geometry.vertices.length; i++) {
            this.curve.geometry.colors[i] = new THREE.Color(
                // `hsl(120, ${i * 50 + 50}%, 48%)`
                `hsl(${Math.ceil(this.color.h)}, ${Math.ceil(i / this.geometry.vertices.length * 100)}%, ${Math.ceil(this.color.l * 100)}%)`
            );
        }
        this.curve.geometry.verticesNeedUpdate = true;
        this.curve.geometry.colorsNeedUpdate = true;
    }

    update() {
        TWEEN.update();
    }

}
