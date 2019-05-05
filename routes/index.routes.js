const express = require('express')
const router = express.Router()
module.exports = router
router.use('/api/v1/posts', require('./post.routes'))
router.use('/api/v1/dates', require('./dates.routes'))
