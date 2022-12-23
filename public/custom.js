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

function handleWSMessage(obj) {
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
  ).inverse();
  var qR = q.mul(qC);

  switch (bone) {
    case "Hips":
      var e = qte(qR);
      x.rotation.set(e.x, -e.z, e.y);
      setLocal(obj.id, e.x, -e.z, e.y)
      setGlobal(obj.id, e.x, -e.z, e.y)
      break;
    case "Spine":
      var e = qte(qR)
      var e1 = getParentNodeEuler(obj.id);
      x.rotation.set(e.x-e1.x, -e.z-e1.y, e.y-e1.z);
      setLocal(obj.id, e.x-e1.x, -e.z-e1.y, e.y-e1.z);
      setGlobal(obj.id, e.x, -e.z, e.y);
      break;
    case "RightLeg":
      var e = qte(qR)
      var e1 = getParentNodeEuler(obj.id);
      x.rotation.set(e.x-e1.x, e.z-e1.y, e.y-e1.z);
      setLocal(obj.id, e.x-e1.x, e.z-e1.y, e.y-e1.z);
      setGlobal(obj.id, e.x, e.z, e.y);
      break;
    case "RightArm":
      var e = qte(qR)
      var e1 = getParentNodeEuler(obj.id);
          console.log(180 * e.x / Math.PI, 180 * e.y / Math.PI, 180 * e.z / Math.PI);
          console.log(180 * e1.x / Math.PI, 180 * e1.y / Math.PI, 180 * e1.z / Math.PI);
     // x.rotation.set(e.x, -e.y, e.z);
          var fy, fx, fz;
          fx = e.x;
          fy = -e.y;
          fz = e.z;
          if(e.y < 0) {
              console.log("here");
              fy =  -(e.y + e1.y) - Math.PI;
          }
          else {
              console.log("here too");
              fy = -(e.y + e1.y);
          }
      x.rotation.set(fx, fy, fz);
      console.log(e.x, -2*Math.PI+(-e.y+e1.y), e.z);
          console.log("......")
      setGlobal(obj.id, -e.x-e1.y, 2*Math.PI + e.y-e1.y, e.z-e1.z);
      break;
    default:
      x.quaternion.set(qR.z, -qR.y, qR.x, qR.w);
      break;
  }
}

function setGlobal(id, x, y, z) {
  mac2Bones[id].global.x = x;
  mac2Bones[id].global.y = y;
  mac2Bones[id].global.z = z;
}

function setLocal(id, x, y, z) {
  mac2Bones[id].local.x = x;
  mac2Bones[id].local.y = y;
  mac2Bones[id].local.z = z;
}

function getParentNodeEuler(child) {
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
        }
    }
  }
  return null;
}
