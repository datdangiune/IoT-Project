const { getFirestoreDatabase } = require('../configs/firebase.config')
const { CHECK_USER_AMOUNT, MIN_AMOUNT, PARKING_LOT, CHECK_USER_CARD } = require('../constants/parking-lot.constants')
const { USER } = require('../constants/user.constants')

const db = getFirestoreDatabase()

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
      start: null,
      parkingUser: null
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

const checkInParkingLot = async (userId, parkingLotId) => {
  try {
    const result = await db.runTransaction(async (transaction) => {
      const userDoc = await transaction.get(db.collection('users').doc(userId))
      const parkingLotDoc = await transaction.get(db.collection('parking').doc(parkingLotId))

      if (!userDoc.exists) {
        return {
          success: false,
          message: USER.NOT_FOUND,
        }
      }
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

      const startTimestamp = admin.firestore.Timestamp.now()
      transaction.update(db.collection('parking').doc(parkingLotId), {
        status: 1,
        start: startTimestamp,
        parkingUser: userId,
      })

      return {
        success: true,
        message: PARKING_LOT.PARKING_SUCCESSFUL,
        parkingLot: parkingLotId,
      }
    })

    return result
  } catch (error) {
    throw new Error(`Error in processing check in: ${error.message}`)
  }
}

const checkOutParkingLot = async (cardId, parkingLotId) => {
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
    const cardData = cardDoc.data()
    const userId = cardData.userId

    const batch = db.batch()
    
    const userDoc = await db.collection('users').doc(userId).get()
    const parkingLotDoc = await db.collection('parking').doc(parkingLotId).get()

    if (!userDoc.exists) {
      return {
        success: false,
        message: USER.NOT_FOUND,
      }
    }
    if (!parkingLotDoc.exists) {
      return {
        success: false,
        message: PARKING_LOT.NOT_FOUND,
      }
    }

    const userData = userDoc.data()
    const parkingLotData = parkingLotDoc.data()
    const userHistory = userData.history || []
    
    userHistory.push({
      checkin: parkingLotData.start,
      checkout: admin.firestore.Timestamp.now(),
      payment: 3000,
    })

    // Update user document
    const userRef = db.collection('users').doc(userId)
    batch.update(userRef, {
      amount: admin.firestore.FieldValue.increment(-3000),
      history: userHistory,
    })

    // Update parking lot document
    const parkingLotRef = db.collection('parking').doc(parkingLotId)
    batch.update(parkingLotRef, {
      status: 0,
      start: null,
      parkingUser: null,
    })

    await batch.commit()

    return {
      success: true,
      message: PARKING_LOT.CHECKOUT_SUCCESFUL,
    }
  } catch (error) {
    throw new Error(`Error in processing check out: ${error.message}`)
  } 
}

module.exports = {
  checkUserAmount,
  checkInParkingLot,
  checkOutParkingLot,
  addParkingLot,
}
