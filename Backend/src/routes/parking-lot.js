const express = require('express')
const asyncHandler = require('../middlewares/async-handler.middleware')
const parkingLotController = require('../controllers/parking-lot.controller')
const router = express.Router()

router.post('/add-parking-lot/:parkingLotId', asyncHandler(parkingLotController.addParkingLot))
router.get('/total-parking-lot', asyncHandler(parkingLotController.getTotalAvailableParkingLot))
router.get('/check-user-amount/:cardId', asyncHandler(parkingLotController.checkUserAmount))
router.post('/entry-parking/:cardId', asyncHandler(parkingLotController.entryParking))
router.post('/check-in/:parkingLotId', asyncHandler(parkingLotController.checkInParkingLot))
router.post('/check-out/:parkingLotId', asyncHandler(parkingLotController.checkOutParkingLot))
router.post('/exit-parking/:cardId', asyncHandler(parkingLotController.exitParking))

module.exports = router
