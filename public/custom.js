function qte(q) {
    var angles = {};
    var den = Math.sqrt(q.w * q.w + q.x * q.x + q.y * q.y + q.z * q.z);
    q.w /= den;
    q.x /= den;
    q.y /= den;
    q.z /= den;

    angles.x = Math.atan2(2 * (q.w * q.x + q.y * q.z), 1 - 2 * (q.x * q.x + q.y * q.y));
    angles.y = Math.asin(2 * (q.w * q.y - q.z * q.x));
    angles.z = Math.atan2(2 * (q.w * q.z + q.x * q.y), 1 - 2 * (q.y * q.y + q.z * q.z));

    return angles;
}


var rigPrefix = "mixamorig";

function calibrate() {
  var keys = Object.keys(mac2Bones);
  for (var i = 0; i < keys.length; i++) {
    mac2Bones[keys[i]].calibration.x = mac2Bones[keys[i]].last.x;
    mac2Bones[keys[i]].calibration.y = mac2Bones[keys[i]].last.y;
    mac2Bones[keys[i]].calibration.z = mac2Bones[keys[i]].last.z;
    mac2Bones[keys[i]].calibration.w = mac2Bones[keys[i]].last.w;
  }
}

var dist = 0;
var gravity = [0, 0, 0]
var alpha = 0.8
var velocityX = 0
var velocityY = 0
var velocityZ = 0

function handleWSMessage(obj) {
  // console.log(mac2Bones[obj.id].id);
  mac2Bones[obj.id].last.x = obj.x;
  mac2Bones[obj.id].last.y = obj.y;
  mac2Bones[obj.id].last.z = obj.z;
  mac2Bones[obj.id].last.w = obj.w;
  var bone = mac2Bones[obj.id].id;
  var x = model.getObjectByName(rigPrefix + bone);
  var q = new Quaternion(obj.x, obj.y, obj.z, obj.w);
  var qC = new Quaternion(
    mac2Bones[obj.id].calibration.x,
    mac2Bones[obj.id].calibration.y,
    mac2Bones[obj.id].calibration.z,
    mac2Bones[obj.id].calibration.w
  );

  var qR = q.mul(qC.inverse());

  var e = qte(qR)
  var e1 = getParentQuat(obj.id);

  if (mac2Bones[obj.id].id == "Hips") {

    madgwickAHRSupdate(obj.gyroX * (Math.PI/180), obj.gyroY * (Math.PI/180), obj.gyroZ * (Math.PI/180), obj.accX,
                    obj.accY, obj.accZ, obj.magX, obj.magY, obj.magZ)
    var R = quatern2rotMat([q0, q1, q2, q3])
    var tcAcc = numeric.dot(R, [obj.accX, obj.accY, obj.accZ])
    tcAcc[2] = tcAcc[2] - 9.81
    // tcAcc = tcAcc.map((val) => val * 9.81);

    console.log(tcAcc)

    var aX = obj.accX
    var aY = obj.accY
    var aZ = obj.accZ

    gravity[0] = alpha * gravity[0] + (1 - alpha) * aX
    gravity[1] = alpha * gravity[1] + (1 - alpha) * aY
    gravity[2] = alpha * gravity[2] + (1 - alpha) * aZ

    linear_aX = (aX - gravity[0]).toFixed(2)
    linear_aY = (aY - gravity[1]).toFixed(2)
    linear_aZ = (aZ - gravity[2]).toFixed(2)

    distX = (velocityX * (0.05) + (0.5) * linear_aX * 0.05 * 0.05).toFixed(2)
    distY = (velocityY * (0.05) + (0.5) * linear_aY * 0.05 * 0.05).toFixed(2)
    distZ = (velocityZ * (0.05) + (0.5) * linear_aZ * 0.05 * 0.05).toFixed(2)

    velocityX = velocityX + linear_aX * 0.05
    velocityY = velocityY + linear_aY * 0.05
    velocityZ = velocityZ + linear_aZ * 0.05

    // console.log(linear_aX, linear_aY, linear_aZ)
    // console.log(linear_aX, linear_aY, linear_aZ)
    // console.log(distX, distY, distZ)
    // if(linear_aX > 0.1 || linear_aY > 0.1 || linear_aZ > 0.1 || linear_aX < -0.1 || linear_aY < -0.1 || linear_aZ < -0.1) {
    //   x.translateX(distX);
    //   x.translateY(distZ);
    //   x.translateZ(-distY);
    // }
  }

  if(e1 == null) {
    // console.log("e", qR.x, qR.y , qR.z ,qR.w);
    x.quaternion.set(qR.z, qR.x, -qR.y, qR.w);
    setLocal(obj.id, qR.x, qR.y, qR.z, qR.w)
    setGlobal(obj.id, qR.x, qR.y, qR.z, qR.w)
  } else {
    // console.log("e", qR.x, qR.y , qR.z ,qR.w);
    // console.log("e1", e1.x,e1.y, e1.z,e1.w);
    // x.rotation.set(e.z+e1.z, e.x-e1.y, -e.y+e1.x);

    var ep = qte(e1);
    // console.log("e " + 180 * e.x / Math.PI, 180 * e.y / Math.PI, 180 * e.z / Math.PI);
    // console.log("e1 " + 180 * ep.x / Math.PI, 180 * ep.y / Math.PI, 180 * ep.z / Math.PI);

    var e1q = new Quaternion(e1.w, e1.x, e1.y, e1.z);
    var qR1 = qR.mul(e1q.inverse());
    // console.log("e1q", qR1.x,qR1.y, qR1.z,qR1.w);

    x.quaternion.set(qR1.z, qR1.x, -qR1.y, qR1.w);
    setLocal(obj.id, qR1.x, qR1.y, qR1.z, qR1.w)
    setGlobal(obj.id, qR.x, qR.y, qR.z, qR.w)
  }

  // switch (bone) {
  //   case "Hips":
  //     var e = qte(qR);
  //     // console.log("e", 180 * e.x / Math.PI, 180 * e.y / Math.PI, 180 * e.z / Math.PI);
  //     // x.rotation.set(e.z, e.x, -e.y);
  //     x.quaternion.set(qR.z, qR.x, -qR.y, qR.w);
  //     setLocal(obj.id, qR.x, qR.y, qR.z, qR.w)
  //     setGlobal(obj.id, qR.x, qR.y, qR.z, qR.w)
  //     break;
  //   case "Spine":
  //     var e = qte(qR)
  //     var e1 = getParentNodeEuler(obj.id);
  //     console.log(e1)
  //     if(e1 == null) {
  //       // x.rotation.set(e.z, e.x, -e.y);
  //       x.quaternion.set(qR.z, qR.x, -qR.y, qR.w);
  //       setLocal(obj.id, qR.x, qR.y, qR.z, qR.w)
  //       setGlobal(obj.id, qR.x, qR.y, qR.z, qR.w)
  //     } else {
  //       console.log("e", qR.x, qR.y , qR.z ,qR.w);
  //       console.log("e1", e1.x,e1.y, e1.z,e1.w);
  //       // console.log(e.z-e1.z, e.x-e1.x, -e.y-e1.y);
  //       // x.rotation.set(e.z+e1.z, e.x-e1.y, -e.y+e1.x);
  //
  //       var e1q = new Quaternion(e1.w,e1.x, e1.y, e1.z);
  //
  //       var qR1 = qR.mul(e1q.inverse());
  //       console.log("e1q", qR1.x,qR1.y, qR1.z,qR1.w);
  //       x.quaternion.set(qR1.z, qR1.x, -qR1.y, qR1.w);
  //       setLocal(obj.id, qR1.x, qR1.y, qR1.z, qR1.w)
  //       setGlobal(obj.id, qR1.x, qR1.y, qR1.z, qR1.w)
  //     }
  //     break;
  //   case "RightUpLeg":
  //     var e = qte(qR)
  //     var e1 = getParentNodeEuler(obj.id);
  //     console.log(e1)
  //     if(e1 == null) {
  //       // x.rotation.set(e.z, e.x, -e.y);
  //       x.quaternion.set(qR.z, qR.x, -qR.y, qR.w);
  //       setLocal(obj.id, qR.x, qR.y, qR.z, qR.w)
  //       setGlobal(obj.id, qR.x, qR.y, qR.z, qR.w)
  //     } else {
  //       console.log("e", qR.x, qR.y , qR.z ,qR.w);
  //       console.log("e1", e1.x,e1.y, e1.z,e1.w);
  //       // console.log(e.z-e1.z, e.x-e1.x, -e.y-e1.y);
  //       // x.rotation.set(e.z+e1.z, e.x-e1.y, -e.y+e1.x);
  //
  //       var e1q = new Quaternion(e1.w,e1.x, e1.y, e1.z);
  //
  //       var qR1 = qR.mul(e1q.inverse());
  //       console.log("e1q", qR1.x,qR1.y, qR1.z,qR1.w);
  //       x.quaternion.set(qR1.z, qR1.x, -qR1.y, qR1.w);
  //       setLocal(obj.id, qR1.x, qR1.y, qR1.z, qR1.w)
  //       setGlobal(obj.id, qR1.x, qR1.y, qR1.z, qR1.w)
  //     }
  //     break;
  //   case "RightArm":
  //     var e = qte(qR)
  //     var e1 = getParentNodeEuler(obj.id);
  //         console.log(180 * e.x / Math.PI, 180 * e.y / Math.PI, 180 * e.z / Math.PI);
  //         console.log(180 * e1.x / Math.PI, 180 * e1.y / Math.PI, 180 * e1.z / Math.PI);
  //    // x.rotation.set(e.x, -e.y, e.z);
  //         var fy, fx, fz;
  //         fx = e.x -e1.x;
  //         fy = -e.y +e1.y;
  //         fz = e.z + e1.z;
  //     x.rotation.set(fx, fy, fz);
  //     console.log(180 * fx / Math.PI, 180 * fy / Math.PI, 180 * fz / Math.PI);
  //         console.log("......")
  //     setGlobal(obj.id, -e.x-e1.y, 2*Math.PI + e.y-e1.y, e.z-e1.z);
  //     break;
  //   default:
  //     x.quaternion.set(qR.z, -qR.y, qR.x, qR.w);
  //     break;
  // }
}

function setGlobal(id, x, y, z, w) {
  mac2Bones[id].global.x = x;
  mac2Bones[id].global.y = y;
  mac2Bones[id].global.z = z;
  mac2Bones[id].global.w = w;
}

function setLocal(id, x, y, z, w) {
  mac2Bones[id].local.x = x;
  mac2Bones[id].local.y = y;
  mac2Bones[id].local.z = z;
  mac2Bones[id].local.w = w;
}

function getParentQuat(child) {
  var id = dependencyGraph[[mac2Bones[child].id]];
  var keys = Object.keys(mac2Bones);
  for (var i = 0; i < keys.length; i++) {
    if (mac2Bones[keys[i]].id == id) {
      if (mac2Bones[keys[i]].global.x == null) {
        return null;
      }
      return {
          x: mac2Bones[keys[i]].global.x,
          y: mac2Bones[keys[i]].global.y,
          z: mac2Bones[keys[i]].global.z,
          w: mac2Bones[keys[i]].global.w
        }
    }
  }
  return null;
}

function quatern2rotMat(q) {
  var R = [[], [], []];
  R[0][0] = 2 * Math.pow(q[0], 2) - 1 + 2 * Math.pow(q[1], 2);
  R[0][1] = 2 * (q[1] * q[2] + q[0] * q[3]);
  R[0][2] = 2 * (q[1] * q[3] - q[0] * q[2]);
  R[1][0] = 2 * (q[1] * q[2] - q[0] * q[3]);
  R[1][1] = 2 * Math.pow(q[0], 2) - 1 + 2 * Math.pow(q[2], 2);
  R[1][2] = 2 * (q[2] * q[3] + q[0] * q[1]);
  R[2][0] = 2 * (q[1] * q[3] + q[0] * q[2]);
  R[2][1] = 2 * (q[2] * q[3] - q[0] * q[1]);
  R[2][2] = 2 * Math.pow(q[0], 2) - 1 + 2 * Math.pow(q[3], 2);
  return R;
}
