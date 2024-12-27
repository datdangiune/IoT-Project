const parkingLotService = require('../services/parking-lot.service')

const addParkingLot = async (req, res, next) => {
  const newParkingLot = await parkingLotService.addParkingLot(req.params.parkingLotId)
  res.status(200).json(newParkingLot)
}

const checkUserAmount = async (req, res, next) => {
  const checkResult = await parkingLotService.checkUserAmount(req.params.cardId)
  res.status(200).json(checkResult)
}

const checkInParkingLot = async (req, res, next) => {
  const checkInResult = await parkingLotService.checkInParkingLot(req.body.cardId, req.body.parkingLotId)
  res.status(200).json(checkInResult)
}

const checkOutParkingLot = async (req, res, next) => {
  const checkOutResult = await parkingLotService.checkOutParkingLot(req.body.cardId, req.body.parkingLotId)
  res.status(200).json(checkOutResult)
}

module.exports = {
  checkUserAmount,
  checkInParkingLot,
  checkOutParkingLot,
  addParkingLot,
}