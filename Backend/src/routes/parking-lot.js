const express = require('express')
const asyncHandler = require('../middlewares/async-handler.middleware')
const parkingLotController = require('../controllers/parking-lot.controller')
const router = express.Router()

router.get('/check-user-amount/:userId', asyncHandler(parkingLotController.checkUserAmount))
router.post('/check-in', asyncHandler(parkingLotController.checkInParkingLot))
router.post('/check-out', asyncHandler(parkingLotController.checkOutParkingLot))
router.post('/add-user', asyncHandler(parkingLotController.addUser))

module.exports = router 