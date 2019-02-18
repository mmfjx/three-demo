let Utils = {
    getHalfPoint: function(p1, p2) {
        var p1 = new THREE.Vector3(p1.x, p1.y, p1.z);
        var p2 = new THREE.Vector3(p2.x, p2.y, p2.z);
        var b2 = p2.sub(p1).divideScalar(2).add(p1);
        return b2;
    },

    getRandSides: function(value) {
        return Math.random() * value * 2 - value;
    },

    PIh: Math.PI / 2,
    PI2: Math.PI * 2,


    createHexagon: function(h, orient, material, ring_width) {
        // var h = .5;
        // var g = ring_width ? new THREE.PRingBufferGeometry( h, h + ring_width, 6, 1 ) : new THREE.CircleBufferGeometry( h, 6 );
        var g = ring_width ? new THREE.RingGeometry(h, h + ring_width, 6, 1) : new THREE.CircleGeometry(h, 6);
        // m.makeScale( -1,1,1 ); g.applyMatrix(m);
        if (orient) {
            var m = new THREE.Matrix4();
            m.identity().makeRotationX(Math.PI / 2);
            g.applyMatrix(m);
            m.identity().makeRotationY(Utils.PI2 / 6 / 2);
            g.applyMatrix(m);
        }

        if (!material) var material = new THREE.MeshBasicMaterial({ color: 0xffffff });
        // material.transparent = true;
        // material.opacity =.5;
        material.side = THREE.BackSide;
        var mesh = new THREE.Mesh(g, material);
        mesh.matrixAutoUpdate = false;

        return mesh;
    },

    orientHexagon: function(mesh, t, look_at_corner) {
        var up_coef = 10;
        mesh.position.copy(t.centerPoint);
        // mesh.scale.set( t.width, t.width, t.width );
        // mesh.scale.set( .001, .001, .001 );
        mesh.up.set(t.centerPoint.x * up_coef, t.centerPoint.y * up_coef, t.centerPoint.z * up_coef);
        if (look_at_corner) mesh.lookAt(t.boundary[0]);
        // mesh.updateMatrix();
    },

    nearestPow2: function(aSize) {
        return Math.pow(2, Math.ceil(Math.log(aSize) / Math.log(2)));
    },

    setFromSpherical: function(radius, u, v, vec3) {
        var spherical = new THREE.Spherical();
        spherical.radius = radius;
        spherical.theta = u * Math.PI * 2 - Math.PI / 2;
        spherical.phi = v * Math.PI;
        if (!vec3) vec3 = new THREE.Vector3();
        vec3.setFromSpherical(spherical);
        return vec3;
    },

};


Utils.getEventCursorPosition = function(e, mouse_obj) {
    var pos;
    var touches = e.originalEvent.touches;
    if (touches) pos = touches.length ? touches[0] : e.originalEvent.changedTouches[0];
    else pos = e;

    if (mouse_obj) {
        mouse_obj.x = pos.clientX;
        mouse_obj.y = pos.clientY;
        return;
    }

    return { x: pos.clientX, y: pos.clientY };
};

Utils.getEventCursorPositionOrientation = function(e, mouse_obj) {
    Util.getEventCursorPosition(e, mouse_obj);
    mouse_obj.x = (mouse_obj.x / window.innerWidth) * 2 - 1;
    mouse_obj.y = -(mouse_obj.y / window.innerHeight) * 2 + 1;
};

Utils.get2dPosition = function(position, camera, dom_element) {
    var v = position.clone().project(camera);
    v.x = (v.x + 1) / 2 * dom_element.innerWidth;
    v.y = -(v.y - 1) / 2 * dom_element.innerHeight; // - window.innerHeight * .08;
    return v;
};



Utils.drawFunction = function(start, end, foo, step, amplitude) {

    console.log('====================================');

    start = start == undefined ? -Math.PI : start;
    end = end == undefined ? Math.PI : end;
    step = step == undefined ? .1 : step;
    amplitude = amplitude == undefined ? 30 : amplitude;
    foo = foo == undefined ? function(v) { return Math.cos(v) } : foo;

    var count = 0;

    for (var y = start; y < end; y += step) {
        var str = '';
        for (var i = 0; i < amplitude * 2; i++) {
            str += i == amplitude ? ':' : "-";
        };
        var p = foo(y);
        var x = Math.round(p * amplitude) + amplitude;
        str = str.substr(0, x) + "*" + str.substr(x + 1);
        console.log(count + " |" + str, x);
        count++;
        if (count >= 10) count = 0;
    }
    console.log('====================================');
};

export default Utils;
