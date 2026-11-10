const db = require("../config/db");


async function recordDevice(data) {
try {
    const {device_id , device_name , ip_address , operating_mode , pump_state , location } = data;

       

        //check if it exist

        const [checkDeviceExistance] = await db.excute("SELECT * FROM devices WHERE device_id = ?" , [device_id]);
        if(checkDeviceExistance.length === 0) {
            const registerDeviceQuery =" INSERT INTO devices (device_id, device_name, ip_address, operating_mode, pump_state, location) VALUES (?, ?, ?, ?, ?, ?)";
            const defaultDeviceName = `ESP32-${device_id}`;
            await db.excute(registerDeviceQuery, [device_id, defaultDeviceName, ip_address, operating_mode, pump_state, location]);

            return {
                message : "Device Registered Successfully",
                validity : Boolean(true),
                detailsOfDevice : {
                    device_id : device_id,
                    device_name : defaultDeviceName,
                    ip_address : ip_address,
                    operating_mode : operating_mode,
                    pump_state : pump_state,
                    location : location
                }
            }
        }

    
} catch (error) {
    console.log("Problem in the device service ")
    return {
        error : error.message,
        validity : Boolean(false)
    }
    
}
 
}

module.exports = {recordDevice}