const db = require("../config/db");


async function recordSoilReading(data) {
    //device_id , moisture , temperature , mode 

    const {device_id , moisture, temperature , mode } = data;

    //sql to be runned to insert 
    const sql = "INSERT INTO soil_readings (device_id , moisture , temperature , mode ) VALUES ( ? , ? , ? , ? )";
    const [result] = await db.excute(sql , [device_id , moisture , temperature , mode || "standard"]);

    const DRY_THRESHOLD = 30.0;
  if (moisture < DRY_THRESHOLD) {
    const alertQuery = 'INSERT INTO soil_alerts (device_id, moisture_level) VALUES (?, ?)';
    await db.execute(alertQuery, [device_id, moisture]);
    console.log(`⚠️ Alert logged: Device ${device_id} reported low moisture (${moisture}%)`);
  }

  return result;

}

module.exports = {recordSoilReading}