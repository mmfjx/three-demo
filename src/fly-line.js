export default class FlyLine {
    constructor(data) {
        this.startPos = data.startPos;
        this.endPos = data.endPos;
        this.color = data.color;
        this.height = data.height;
        this.endPointIndex = 1;
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
        // let curveGeometry = new THREE.BufferGeometry().setFromPoints( points );
        this.geometry = new THREE.Geometry();
        this.geometry.verticesNeedUpdate = true;
        this.geometry.elementsNeedUpdate = true;
        this.geometry.morphTargetsNeedUpdate = true;
        this.geometry.uvsNeedUpdate = true;
        this.geometry.normalsNeedUpdate = true;
        this.geometry.colorsNeedUpdate = true;
        this.geometry.tangentsNeedUpdate = true;
        this.geometry.vertices = this.curveModelData.slice(0, 1);
        for (let i = 0; i < this.geometry.vertices.length; i++) {
            this.geometry.colors[i] = new THREE.Color(
                "hsl(" + (i * 0.6 + 180) + ",70%,70%)"
            );
        }
        this.material = new THREE.LineBasicMaterial({
            vertexColors: THREE.VertexColors,
            linewidth: 4,
        });
        this.curve = new THREE.Line(this.geometry, this.material);
        this.speed = (Math.random() + 0.1) * 0.0002;
    }
    update() {
        if (this.endPointIndex >= 50) {
            this.endPointIndex = 1;
        } else {
            this.endPointIndex++;
        }
        this.endPointIndex = Math.ceil(this.endPointIndex);
        let curvePartialData = new THREE.CatmullRomCurve3(this.curveModelData.slice(0, this.endPointIndex));
        if (!curvePartialData.length) {
            return;
        }
        this.curve.geometry.vertices = curvePartialData.getPoints(50);
        for (let i = 0; i < this.curve.geometry.vertices.length; i++) {
            this.curve.geometry.colors[i] = new THREE.Color(
                "hsl(" + (i * 0.6 + 180) + ",70%,70%)"
            );
        }
        this.curve.geometry.verticesNeedUpdate = true;
        this.curve.geometry.colorsNeedUpdate = true;
    }

}

