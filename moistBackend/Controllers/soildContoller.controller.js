const soilService = require("../Service/soilService.service");


async function getSoilStatus(req , res) {

    try {
        const {device_id , moisture , temperature , mode } = req;
        if(!device_id || moisture === undefined || temperature === undefined ) {
            return res.status(400).json({
                message : "Invalid Data Sent",
                validity : Boolean(false)
            })
        }

        const result = await soilService.recordSoilReading({
            device_id , moisture , temperature , mode
        })

        return res.status(201).json({ 
      success: true, 
      message: result.autoRegistered ? "Soil reading recorded and device auto-registered successfully" : "Soil reading recorded successfully",
      device_id: device_id,
      insertId: result.insertId 
    });
        
    } catch (error) {

        throw new Error("Error in postSoilStatus in the soilContoller")
        
    }

}



module.exports = {getSoilStatus}