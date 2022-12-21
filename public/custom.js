function qte(q0,q1,q2,q3) {
  const Rx = Math.atan2((2 * q1 * q2) - (2 * q0 * q3), (2 * q0 * q0) + ((2 * q1 * q1) - 1))
  const Ry = -Math.asin(((2 * q1 * q3) + (2 * q0 * q2))); 
  const Rz = Math.atan2((2 * q2 * q3) - (2 * q0 * q1), (2 * q0 * q0) + ((2 * q3 * q3) - 1));

  const euler = {x:Rx, y:Ry, z:Rz};

  return(euler);
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
      var e = qte(qR.w, qR.x, qR.y, qR.z);
      x.rotation.set(-e.z, e.x, e.y);
      setGlobal(obj.id, -e.z, e.x, e.y)
      break;
    case "Spine":
      var e = qte(qR.w, qR.x, qR.y, qR.z);
      var e1 = getParentNodeEuler(obj.id);
      x.rotation.set(Math.PI+e.z+e1.x, Math.PI+e.x-e1.y, e.y-Math.PI-e1.z)
      setGlobal(obj.id, Math.PI+e.z+e1.x, Math.PI+e.x-e1.y, e.y-Math.PI-e1.z)
      break;
    case "RightArm":
      var e = qte(qR.z, qR.y, qR.w, qR.x);
      var e1 = getParentNodeEuler(obj.id);
      //x.rotation.set(-Math.PI-e.z, Math.PI+e.x, -e.y);
      x.rotation.set(e.z-e1.x, e.x-e1.y, Math.PI+e.y-e1.z);
      setGlobal(obj.id, -e.x-e1.x, 2*Math.PI + e.y-e1.y, e.z-e1.z);
      break;
    default:
      x.quaternion.set(qR.z, -qR.y, qR.x, qR.w);
      break;
  }
}

function setGlobal(id, x, y, z, w) {
  mac2Bones[id].global.x = x;
  mac2Bones[id].global.y = y;
  mac2Bones[id].global.z = z;
  mac2Bones[id].global.w = w;
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
