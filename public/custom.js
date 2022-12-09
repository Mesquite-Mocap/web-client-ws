var rigPrefix = "mixamorig";

function calibrate() {
    var keys = Object.keys(mac2Bones);
    for(var i = 0; i < keys.length; i++) {
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
      var qC = new Quaternion(mac2Bones[obj.id].calibration.x,mac2Bones[obj.id].calibration.y,mac2Bones[obj.id].calibration.z,mac2Bones[obj.id].calibration.w).inverse()
      var qR = q.mul(qC);
      // console.log(obj.id);

      if(mac2Bones[obj.id].id == "Hips") {
        x.quaternion.set(qR.z, qR.x, qR.y, qR.w);
      } else if(mac2Bones[obj.id].id == "Hips") {
        x.quaternion.set(qR.z, qR.x, qR.y, qR.w);
      } else {
        if(mac2Bones[obj.id].id in dependencyGraph) {
            var parent = getQuaternion(dependencyGraph[mac2Bones[obj.id].id]);
            if(parent != null) {
                var q1 = new Quaternion(qR.x, qR.y, qR.z, qR.w);
                var qC1 = parent
                var qR1 = q1.mul(qC1);
                x.quaternion.set(qR1.z, -qR1.y, qR1.x, qR1.w);
            } else {
                x.quaternion.set(qR.z, -qR.y, qR.x, qR.w);
            }
        } else {
            x.quaternion.set(qR.x, qR.y, qR.z, -qR.w);
            mac2Bones[obj.id].global.x = qR.x;
            mac2Bones[obj.id].global.y = qR.y;
            mac2Bones[obj.id].global.z = qR.z;
            mac2Bones[obj.id].global.w = qR.w;
        }
      }

      // if(mac2Bones[obj.id].id in dependencyGraph) {
      //     var parent = getQuaternion(dependencyGraph[mac2Bones[obj.id].id]);
      //     if(parent != null) {
      //         var q1 = new Quaternion(qR.x, qR.y, qR.z, qR.w);
      //         var qC1 = parent
      //         var qR1 = q1.mul(qC1);
      //         x.quaternion.set(qR1.z, -qR1.y, qR1.x, qR1.w);
      //     } else {
      //         x.quaternion.set(qR.z, -qR.y, qR.x, qR.w);
      //     }
      // } else {
      //     x.quaternion.set(qR.x, qR.y, qR.z, -qR.w);
      //     mac2Bones[obj.id].global.x = qR.x;
      //     mac2Bones[obj.id].global.y = qR.y;
      //     mac2Bones[obj.id].global.z = qR.z;
      //     mac2Bones[obj.id].global.w = qR.w;
      // }
}

function getQuaternion(id) {
      var keys = Object.keys(mac2Bones);
      for(var i = 0; i < keys.length; i++) {
          if(mac2Bones[keys[i]].id == id) {
              if(mac2Bones[keys[i]].global.x == null) {
                  return null
              }
              return new Quaternion(mac2Bones[keys[i]].global.x,mac2Bones[keys[i]].global.y,mac2Bones[keys[i]].global.z,mac2Bones[keys[i]].global.w);
          }
      }
      return null
}
