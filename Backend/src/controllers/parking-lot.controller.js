const parkingLotService = require('../services/parking-lot.service')

const checkUserAmount = async (req, res, next) => {
  const checkResult = await parkingLotService.checkUserAmount(req.params.userId)
  res.status(200).json(checkResult)
}

const checkInParkingLot = async (req, res, next) => {
  const checkInResult = await parkingLotService.checkInParkingLot(req.body.userId, req.body.parkingLotId)
  res.status(200).json(checkInResult)
}

const checkOutParkingLot = async (req, res, next) => {
  const checkOutResult = await parkingLotService.checkOutParkingLot(req.body.userId, req.body.parkingLotId)
  res.status(200).json(checkOutResult)
}

const addUser = async (req, res, next) => {
  const addUserResult = await parkingLotService.addUser(req.body.userId, req.body.userData)
  res.status(200).json(addUserResult)
}

module.exports = {
  checkUserAmount,
  checkInParkingLot,
  checkOutParkingLot,
  addUser,
}