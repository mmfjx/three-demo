export default class ProjectiveImage {
    constructor(_img_url, _onload) {
        this.projectionContext;

        var img = document.createElement("img");
        img.src = _img_url;
        img.crossOrigin = '';
        img.onload = () => {
            console.log("image loaded");
            var projectionCanvas = document.createElement('canvas');
            this.projectionContext = projectionCanvas.getContext('2d');
            projectionCanvas.width = img.width;
            projectionCanvas.height = img.height;
            projectionCanvas.id = "canvas";
            this.projectionContext.drawImage(img, 0, 0, img.width, img.height);
            if (_onload) _onload();
        };
        this.img = img;

        this.pixelData = null;

        this.maxLat = -100;
        this.maxLon = 0;
        this.minLat = 0;
        this.minLon = 0;
    }

    isLand(lat, lon) {

        var x = parseInt(this.img.width * (lon + 180) / 360); // 图片中第几列的像素点
        var y = parseInt(this.img.height * (lat + 90) / 180); // 图片中第几行的像素点

        if (this.pixelData == null) {
            this.pixelData = this.projectionContext.getImageData(0, 0, this.img.width, this.img.height);
        }
        // (y * this.pixelData.width + x) 哪行哪列的像素较差点
        return this.pixelData.data[(y * this.pixelData.width + x) * 4] === 0;
    }

    isLandByUV(u, v) {
        if (this.pixelData == null) {
            this.pixelData = this.projectionContext.getImageData(0, 0, this.img.width, this.img.height);
        }
        var x = parseInt(this.img.width * u);
        var y = parseInt(this.img.height * v);
        return this.pixelData.data[(y * this.pixelData.width + x) * 4] === 0;
    }

    getUV(lat, lon) {
        return {
            x: (lon + 180) / 360,
            y: (lat + 90) / 180
        };
    }

    getUVOfPI(lat, lon) {
        let PIh = Math.PI / 2;
        let PI2 = Math.PI * 2;
        return {
            x: (lon + Math.PI) / PI2,
            y: (lat + PIh) / Math.PI
        };
    }
}
