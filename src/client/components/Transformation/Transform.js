
  const THREE = window.THREE;  


    /////////////////////////////////////////////////////////////
    // Gets input transform
    //
    /////////////////////////////////////////////////////////////
    function getScale() {

      var x = 0.0055
      var y = 0.0055
      var z = 0.0055

      // x = isNaN(x) ? 1.0 : x;
      // y = isNaN(y) ? 1.0 : y;
      // z = isNaN(z) ? 1.0 : z;

      return new THREE.Vector3(x, y, z);
    }

    function getTranslation() {

      var x = -80.00
      var y = -25.00
      var z = -18.00

      // x = isNaN(x) ? 0.0 : x;
      // y = isNaN(y) ? 0.0 : y;
      // z = isNaN(z) ? 0.0 : z;

      return new THREE.Vector3(x, y, z);
    }

    function getRotation() {

      var x = 90.00
      var y = 0.00
      var z = 0.00

      // x = isNaN(x) ? 0.0 : x;
      // y = isNaN(y) ? 0.0 : y;
      // z = isNaN(z) ? 0.0 : z;

      var euler = new THREE.Euler(
        x * Math.PI/180,
        y * Math.PI/180,
        z * Math.PI/180,
        'XYZ');

      var q = new THREE.Quaternion();

      q.setFromEuler(euler);

      return q;
    }

    /////////////////////////////////////////////////////////////
    // Builds transform matrix
    //
    /////////////////////////////////////////////////////////////
    function buildTransformMatrix() {
      console.log('Im inside of transform');
      var t = getTranslation();
      var r = getRotation();
      var s = getScale();
      console.log('Value T', t);
      console.log('Value R', r);
      console.log('Value S', s);

      var m = new THREE.Matrix4();

      m.compose(t, r, s);
      console.log('Return M ',m);
      return m;
    }


const Transform = {
  buildTransformMatrix
};

export default Transform;