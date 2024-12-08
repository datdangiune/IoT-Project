const WHITELIST = []

const corsConfig = {
  origin: function(origin, callback) {
    if (WHITELIST.includes(origin) !== -1 || !origin) {
      callback(null, true)
    } else {
      callback(new Error("Not allowed by CORS"))
    }
  },
  credentials: true,
}

module.exports = corsConfig
