const express = require('express')
const asyncHandler = require('../middlewares/async-handler.middleware')
const parkingLotController = require('../controllers/parking-lot.controller')
const router = express.Router()

router.post('/check-in', asyncHandler(parkingLotController.checkInParkingLot))
router.post('/check-out', asyncHandler(parkingLotController.checkOutParkingLot))
router.post('/add-parking-lot/:parkingLotId', asyncHandler(parkingLotController.addParkingLot))
router.get('/check-user-amount/:cardId', asyncHandler(parkingLotController.checkUserAmount))

module.exports = router 