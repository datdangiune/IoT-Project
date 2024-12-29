const admin = require('firebase-admin')
const { getFirestoreDatabase } = require('../configs/firebase.config')
const { CHECK_USER_AMOUNT, MIN_AMOUNT, PARKING_LOT, CHECK_USER_CARD } = require('../constants/parking-lot.constants')
const { USER } = require('../constants/user.constants')

const db = getFirestoreDatabase()
let previousTotal = 2
let currentTotal = 2

const addUserAndCard = async (userId, cardId) => {
  try {
    const userDoc = await db.collection('users').doc(userId).get()
    if (userDoc.exists) {
      return {
        success: false,
        message: USER.ALREADY_EXIST,
      }
    }
    const cardDoc = await db.collection('cards').doc(cardId).get()
    if (cardDoc.exists) {
      return {
        success: false,
        message: USER.USER_CARD_ALREADY_EXIST,
      }
    }

    const newCardDoc = await db.collection('cards').doc(cardId).set({
      cardId: cardId,
      userId: userId,
    })
    const newUserDoc = await db.collection('users').doc(userId).set({
      username: userId,
      password: '123',
      amount: 500000,
      history: []
    })

    return {
      success: true,
      message: USER.CREATED_SUCCESSFUL,
      newCard: newCardDoc,
      newUser: newUserDoc,
    }
  } catch (error) {
    throw new Error(`Error adding user and card: ${error.message}`)
  }
}

const addParkingLot = async (parkingLotId) => {
  try {
    const parkingLotDoc = await db.collection('parking').doc(parkingLotId).get()
    if (parkingLotDoc.exists) {
      return {
        success: false,
        message: PARKING_LOT.ALREADY_EXISTS
      }
    }

    await db.collection('parking').doc(parkingLotId).set({
      id: parkingLotId,
      status: 0,
    })

    return {
      success: true,
      message: PARKING_LOT.CREATED_SUCCESSFUL,
      parkingLotId: parkingLotId
    }
  } catch (error) {
    throw new Error(`Error adding parking lot: ${error.message}`)
  }
}

const getSlotStatus = async () => {
  try {
    const parkingQuery = await db.collection('parking').get()
    const slots = []

    parkingQuery.forEach(doc => {
      const data = doc.data()
      slots.push({
        id: data.id,
        status: data.status,
      })
    })

    return {
      success: true,
      slots: slots
    }
  } catch (error) {
    throw new Error(`Error getting slot status: ${error.message}`)
  }
}

const getTotalAvailableParkingLot = async () => {
  try {
    const parkingQuery = await db.collection('parking').where('status', '==', 0).get()
    const availableLots = parkingQuery.size

    return {
      success: true,
      availableLots: availableLots
    }
  } catch (error) {
    throw new Error(`Error getting total available parking lot: ${error.message}`)
  }
}

const checkUserAmount = async (cardId) => {
  try {
    // Check if card exists
    const cardDoc = await db.collection('cards').doc(cardId).get()
    if (!cardDoc.exists) {
      return {
        success: false,
        message: CHECK_USER_CARD.NOT_EXIST,
      }
    }
    // Get userId from card
    const cardData = cardDoc.data()
    const userId = cardData.userId

    const userDoc = await db.collection('users').doc(userId).get()
    if (!userDoc.exists) {
      return {
        success: false,
        message: USER.NOT_FOUND,
      }
    }

    const userData = userDoc.data()
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
      currentAmount: userData.amount,
      userId: userId,
    }

  } catch (error) {
    throw new Error(`Error checking user amount: ${error.message}`)
  }
}

const entryParking = async (cardId) => {
  try {
    // Check if card exists
    const cardDoc = await db.collection('cards').doc(cardId).get()
    if (!cardDoc.exists) {
      return {
        success: false,
        message: CHECK_USER_CARD.NOT_EXIST
      }
    }

    // Get userId from card
    const userId = cardDoc.data().userId
    const userDoc = await db.collection('users').doc(userId).get()

    if (!userDoc.exists) {
      return {
        success: false,
        message: USER.NOT_FOUND
      }
    }

    // Get current history array or initialize if doesn't exist
    const userData = userDoc.data()
    const currentHistory = userData.history || []

    if (currentHistory.length !== 0) {
      const lastHistory = currentHistory[currentHistory.length - 1]
      if (!lastHistory.checkout) {
        return {
          success: false,
          message: PARKING_LOT.INVALID_ENTRY,
        }
      }
    }

    // Create new history object
    const startTimestamp = new Date()
    const newHistory = {
      checkin: startTimestamp,
      checkout: null,
      payment: 0,
    }
    // Update user document with new history
    await db.collection('users').doc(userId).update({
      history: [...currentHistory, newHistory]
    })

    return {
      success: true,
      history: newHistory,
      userId: userId
    }
  } catch (error) {
    throw new Error(`Error in processing entry: ${error.message}`)
  }
}


const checkInParkingLot = async (parkingLotId) => {
  try {
    const result = await db.runTransaction(async (transaction) => {
      const parkingLotDoc = await transaction.get(db.collection('parking').doc(parkingLotId))

      if (!parkingLotDoc.exists) {
        return {
          success: false,
          message: PARKING_LOT.NOT_FOUND,
        }
      }

      const parkingLotData = parkingLotDoc.data()
      if (parkingLotData.status === 1) {
        return {
          success: false,
          message: PARKING_LOT.ALREADY_OCCUPIED,
        }
      }
      
      // Update parking lot status
      previousTotal = currentTotal
      currentTotal -= 1
      await transaction.update(db.collection('parking').doc(parkingLotId), {
        status: 1,
      })

      // Get total available parking lots
      const parkingQuery = await db.collection('parking').where('status', '==', 0).get()
      const availableLots = parkingQuery.size

      return {
        success: true,
        message: PARKING_LOT.PARKING_SUCCESSFUL,
        parkingLot: parkingLotId,
        availableLots: availableLots
      }
    })

    return result
  } catch (error) {
    throw new Error(`Error in processing check in: ${error.message}`)
  }
}

const checkOutParkingLot = async (parkingLotId) => {
  try {
    const parkingLotDoc = await db.collection('parking').doc(parkingLotId).get()

    if (!parkingLotDoc.exists) {
      return {
        success: false,
        message: PARKING_LOT.NOT_FOUND
      }
    }

    const parkingLotData = parkingLotDoc.data()
    if (parkingLotData.status === 0) {
      return {
        success: false,
        message: PARKING_LOT.INVALID_CHECKOUT
      }
    }

    previousTotal = currentTotal
    currentTotal += 1
    await db.collection('parking').doc(parkingLotId).update({
      status: 0,
    })

    // Get total available parking lots
    const parkingQuery = await db.collection('parking').where('status', '==', 0).get()
    const availableLots = parkingQuery.size

    return {
      success: true,
      message: PARKING_LOT.CHECKOUT_SUCCESFUL,
      availableLots: availableLots
    }
  } catch (error) {
    throw new Error(`Error in processing check out: ${error.message}`)
  }
}

const exitParking = async (cardId) => {
  try {
    const cardDoc = await db.collection('cards').doc(cardId).get()
    if (!cardDoc.exists) {
      return {
        success: false,
        message: CHECK_USER_CARD.NOT_EXIST
      }
    }

    const userId = cardDoc.data().userId
    const userDoc = await db.collection('users').doc(userId).get()
    const userData = userDoc.data()

    if (!userData.history || userData.history.length === 0) {
      return {
        success: false,
        message: USER.NO_HISTORY_FOUND,
      }
    }

    // Add check for invalid exit
    if (currentTotal <= previousTotal) {
      return {
        success: false,
        message: PARKING_LOT.CAN_NOT_EXIT
      }
    }

    // Get and update last history entry
    const lastHistory = userData.history[userData.history.length - 1]
    if (lastHistory.checkout) {
      return {
        success: false,
        message: PARKING_LOT.INVALID_EXIT,
      }
    }
    const updatedHistory = {
      ...lastHistory,
      checkout: new Date(),
      payment: 3000
    }
    // Update history array
    userData.history[userData.history.length - 1] = updatedHistory

    // Update user document
    await db.collection('users').doc(userId).update({
      history: userData.history,
      amount: admin.firestore.FieldValue.increment(-3000)
    })

    return {
      success: true,
      history: updatedHistory
    }
  } catch (error) {
    throw new Error(`Error in processing exit: ${error.message}`)
  }
}

module.exports = {
  addUserAndCard,
  addParkingLot,
  getSlotStatus,
  getTotalAvailableParkingLot,
  checkUserAmount,
  entryParking,
  checkInParkingLot,
  checkOutParkingLot,
  exitParking,
}
