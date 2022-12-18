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
      x.quaternion.set(qR.x, qR.z, qR.y, qR.w);
      setGlobal(obj.id, qR.x, qR.z, qR.y, qR.w);
      break;
    case "Spine":
      var q1 = new Quaternion(qR.x, qR.z, qR.y, qR.w);
      var qC1 = getparentNodeQuaternion(obj.id);
      var qR1 = q1.mul(qC1);
      qR = JSON.parse(JSON.stringify(qR1));
      x.quaternion.set(qR.x, qR.z, qR.y, qR.w);
      setGlobal(obj.id, qR.x, qR.z, qR.y, qR.w);
      break;
    case "RightArm":
      var q1 = new Quaternion(qR.x, qR.z, qR.y, qR.w);
      var qC1 = getparentNodeQuaternion(obj.id);
      var qR1 = q1.mul(qC1);
      qR = JSON.parse(JSON.stringify(qR1));
      x.quaternion.set(qR.x, qR.z, qR.y, qR.w);
      setGlobal(obj.id, qR.x, qR.z, qR.y, qR.w);
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

function getparentNodeQuaternion(child) {
  var id = dependencyGraph[[mac2Bones[child].id]];
  var keys = Object.keys(mac2Bones);
  for (var i = 0; i < keys.length; i++) {
    if (mac2Bones[keys[i]].id == id) {
      if (mac2Bones[keys[i]].global.x == null) {
        return null;
      }
      return new Quaternion(
        mac2Bones[keys[i]].global.x,
        mac2Bones[keys[i]].global.y,
        mac2Bones[keys[i]].global.z,
        mac2Bones[keys[i]].global.w
      );
    }
  }
  return null;
}
