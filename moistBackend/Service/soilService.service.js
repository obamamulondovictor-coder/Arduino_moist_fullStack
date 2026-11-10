const db = require("../config/db");


async function recordSoilReading(data) {
    //device_id , moisture , temperature , mode 

    const {device_id , moisture, temperature , mode } = data;

    const checkDeviceExistance = await db.excute("SELECT * FROM devices WHERE device_id = ?" , [device_id]);
    if(checkDeviceExistance[0].length === 0) {
        // throw new Error("Device not found in the database");

        const defaultDeviceName = `${device_id}`;
        const registerDeviceQuery =" INSERT INTO devices (device_id, device_name, location, status) VALUES (?, ?, ?, 'active')";
        await db.excute(registerDeviceQuery, [device_id, defaultDeviceName, null]);

        console.log(`Device ${device_id} not found. Registered as a new device with default name: ${defaultDeviceName}`);
    }

    //sql to be runned to insert 
    const sql = "INSERT INTO soil_readings (device_id , moisture , temperature , mode ) VALUES ( ? , ? , ? , ? )";
    const [result] = await db.excute(sql , [device_id , moisture , temperature , mode || "standard"]);

    const DRY_THRESHOLD = 30.0;
  if (moisture < DRY_THRESHOLD) {
    const alertQuery = 'INSERT INTO soil_alerts (device_id, moisture_level) VALUES (?, ?)';
    await db.execute(alertQuery, [device_id, moisture]);
    console.log(`⚠️ Alert logged: Device ${device_id} reported low moisture (${moisture}%)`);
  }

  return {
    insertId: result.insertId,
    message: "Soil reading recorded successfully",
    status: "success",
    autoRegistered: checkDeviceExistance[0].length === 0 ? true : false
  };

}

module.exports = {recordSoilReading}