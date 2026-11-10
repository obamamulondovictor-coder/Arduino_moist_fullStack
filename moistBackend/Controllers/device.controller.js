const db = require("../config/db");
const Device = require("../Service/device.service")
async function recordDeviceDetails(req , res) {
    try {

        const {device_id , device_name , ip_address , operating_mode , pump_state , location } = req.body;

        if(!device_id || !device_name || !ip_address || !operating_mode || !pump_state || !location) {
            return res.status(400).json({
                message : "Invalid Data Sent",
                validity : Boolean(false)
            })
        }

        //save the device 

        const saveDevice = Device.recordDevice({device_id , device_name , ip_address , operating_mode , pump_state , location})
        
        if(saveDevice.validity === false) {
            return res.status(500).json({
                message : "Something Went Wrong"
            })

        }
        return res.status(201).json({
            savedDevice : saveDevice
        })

        
        
    } catch (error) {
        res.status(500).json({
            message : "Internal Server Error",
            validity : Boolean(false)
        })

        throw new Error("Error in recordDeviceDetails in the deviceController");
    }
}

async function changeDeviceMode(req , res) {
    try {

        // wait for the command  ,device_id and mode from the request body
        const {device_id , mode } = req.body;

        if(!device_id || !mode) {
            return res.status(400).json({
                message : "Invalid Data Sent",
                validity : Boolean(false)
            })
        }

        if(mode !== "auto" && mode !== "manual") {
            return res.status(400).json({
                message : "Invalid Mode Sent",
                validity : Boolean(false)
            })
        }   
      

        //check if it exist
        const [checkDeviceExistance] = await db.excute("SELECT * FROM devices WHERE device_id = ?" , [device_id]);
        if(checkDeviceExistance.length === 0 || !checkDeviceExistance[0].ip_address) {
            return res.status(404).json({
                message : "Device Not Found Or Ip Not There",
                validity : Boolean(false)
            })
        }

        //get the ip of the device from the database
        const deviceIp = checkDeviceExistance[0].ip_address;
        const targetUrl = `http://${deviceIp}/device/mode`; // Assuming the device has an endpoint to change mode

        const response = await fetch(targetUrl , {
            method : "POST",
            headers : {
                "Content-Type" : "application/json"
            },
            body : JSON.stringify({mode}) 
        })

        if(!response.ok) {
            return res.status(500).json({
                message : "ESP32 FAILED TO CHANGE MODE",
                validity : Boolean(false)
            })
        }
        //update the mode
        const updateMode = "UPDATE devices SET operating_mode = ? WHERE device_id = ?";
        await db.excute(updateMode , [mode , device_id]);

        return res.status(200).json({
            message : "Device Mode Changed Successfully",
            validity : Boolean(true)
        })
        
    } catch (error) {

        console.log("Error in changeDeviceMode in the soilContoller")
        return res.status(500).json({
            message : "Failed To Change Device Mode",
            validity : Boolean(false)
        })
        
    }
}



module.exports = {recordDeviceDetails , changeDeviceMode };