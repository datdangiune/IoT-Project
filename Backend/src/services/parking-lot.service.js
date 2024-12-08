const { getRealtimeDatabase } = require('../configs/firebase-realtime.config')
const { CHECK_USER_AMOUNT, MIN_AMOUNT, PARKING_LOT } = require('../constants/parking-lot.constants')
const { USER } = require('../constants/user.constants')

const addUser = async (userId, userData) => {
  try {
    const userRef = getRealtimeDatabase().ref(`users/${userId}`)
    await userRef.set(userData)
    return {
      success: true,
      message: 'User added successfully',
    }
  } catch (error) {
    throw new Error(`Error adding user: ${error.message}`)
  }
}

const checkUserAmount = async (userId) => {
  try {
    const userRef = getRealtimeDatabase().ref(`users/${userId}`)
    const snapshot = await userRef.once('value')
    const userData = snapshot.val()
    if (!userData) {
      return {
        success: false,
        message: USER.NOT_FOUND,
      }
    }

    if (userData.amount < MIN_AMOUNT) {
      return {
        success: false,
        message: CHECK_USER_AMOUNT.INSUFFICIENT,
        currentAmount: userData.amount
      }
    }

    return {
      success: true,
      message: CHECK_USER_AMOUNT.SUFFICIENT,
      currentAmount: userData.amount
    }

  } catch (error) {
    throw new Error(`Error checking user amount: ${error.message}`)
  }
}

const checkInParkingLot = async (userId, parkingLotId) => {
  try {
    const userRef = getRealtimeDatabase().ref(`users/${userId}`)
    const parkingLotRef = getRealtimeDatabase().ref(`parkingLots/${parkingLotId}`)
    const userSnapshot = await userRef.once('value')
    const parkingLotSnapshot = await parkingLotRef.once('value')
    const userData = userSnapshot.val()
    const parkingLotData = parkingLotSnapshot.val()

    if (!userData) {
      return {
        success: false,
        message: USER.NOT_FOUND,
      }
    }
    if (!parkingLotData) {
      return {
        success: false,
        message: PARKING_LOT.NOT_FOUND,
      }
    }

    if (parkingLotData.status == 1) {
      return {
        success: false,
        message: PARKING_LOT.ALREADY_OCCUPIED,
      }
    }

    const startTimestamp = new Date()
    await parkingLotRef.update({
      status: 1,
      start: startTimestamp,
      parkingUser: userId,
    })

    return {
      success: true,
      message: PARKING_LOT.PARKING_SUCCESSFUL,
      parkingLot: parkingLotId,
    }
  } catch (error) {
    throw new Error(`Error in processing check in: ${error.message}`)
  }
}

const checkOutParkingLot = async (userId, parkingLotId) => {
  try {
    const userRef = getRealtimeDatabase().ref(`users/${userId}`)
    const parkingLotRef = getRealtimeDatabase().ref(`parkingLots/${parkingLotId}`)
    const userSnapshot = await userRef.once('value')
    const parkingLotSnapshot = await parkingLotRef.once('value')
    const userData = userSnapshot.val()
    const parkingLotData = parkingLotSnapshot.val()

    if (!userData) {
      return {
        success: false,
        message: USER.NOT_FOUND,
      }
    }
    if (!parkingLotData) {
      return {
        success: false,
        message: PARKING_LOT.NOT_FOUND,
      }
    }

    const userHistory = userData.history
    userHistory.push({
      checkin: parkingLotData.start,
      checkout: new Date(),
      payment: 3000,
    })

    await userRef.update({
      amount: userData.amount - 3000,
      history: userHistory,
    })

    await parkingLotRef.update({
      status: 0,
      start: null,
      parkingUser: null,
    })

    return {
      success: true,
      message: PARKING_LOT.CHECKOUT_SUCCESFUL,
    }
  } catch (error) {
    throw new Error(`Error in processing check in: ${error.message}`)
  } 
}

module.exports = {
  checkUserAmount,
  checkInParkingLot,
  checkOutParkingLot,
  addUser,
}
