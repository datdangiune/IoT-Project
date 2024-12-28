const parkingLotService = require('../services/parking-lot.service')

const addParkingLot = async (req, res, next) => {
  const newParkingLot = await parkingLotService.addParkingLot(req.params.parkingLotId)
  res.status(200).json(newParkingLot)
}

const getSlotStatus = async (req, res, next) => {
  const slotStatus = await parkingLotService.getSlotStatus()
  res.status(200).json(slotStatus)
}

const getTotalAvailableParkingLot = async (req, res, next) => {
  const totalAvailableParkingLot = await parkingLotService.getTotalAvailableParkingLot()
  res.status(200).json(totalAvailableParkingLot)
}

const checkUserAmount = async (req, res, next) => {
  const checkResult = await parkingLotService.checkUserAmount(req.params.cardId)
  res.status(200).json(checkResult)
}

const entryParking = async (req, res, next) => {
  const checkResult = await parkingLotService.entryParking(req.params.cardId)
  res.status(200).json(checkResult)
}

const checkInParkingLot = async (req, res, next) => {
  const checkInResult = await parkingLotService.checkInParkingLot(req.params.parkingLotId)
  res.status(200).json(checkInResult)
}

const checkOutParkingLot = async (req, res, next) => {
  const checkOutResult = await parkingLotService.checkOutParkingLot(req.params.parkingLotId)
  res.status(200).json(checkOutResult)
}

const exitParking = async (req, res, next) => {
  const checkOutResult = await parkingLotService.exitParking(req.params.cardId)
  res.status(200).json(checkOutResult)
}

module.exports = {
  addParkingLot,
  getSlotStatus,
  getTotalAvailableParkingLot,
  checkUserAmount,
  entryParking,
  checkInParkingLot,
  checkOutParkingLot,
  exitParking,
}