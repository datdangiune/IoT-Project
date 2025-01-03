const CHECK_USER_AMOUNT = {
  'INSUFFICIENT': 'INSUFFICIENT_BALANCE',
  'SUFFICIENT': 'SUFFICIENT_BALANCE',
}

const CHECK_USER_CARD = {
  'NOT_EXIST': 'NOT_EXIST'
}

const MIN_AMOUNT = 3000

const PARKING_LOT = {
  'ALREADY_EXISTS': 'ALREADY_EXISTS',
  'CREATED_SUCCESSFUL': 'CREATED_SUCCESSFUL',
  'NOT_FOUND': 'NOT_FOUND',
  'ALREADY_OCCUPIED': 'ALREADY_OCCUPIED',
  'INVALID_ENTRY': 'INVALID_ENTRY',
  'INVALID_EXIT': 'INVALID_EXIT',
  'CAN_NOT_EXIT': 'CAN_NOT_EXIT',
  'INVALID_CHECKOUT': 'INVALID_CHECKOUT',
  'PARKING_SUCCESSFUL': 'PARKING_SUCCESSFUL',
  'CHECKOUT_SUCCESFUL': 'CHECKOUT_SUCCESSFUL',
}

module.exports = {
  CHECK_USER_AMOUNT,
  MIN_AMOUNT,
  PARKING_LOT,
  CHECK_USER_CARD,
}
