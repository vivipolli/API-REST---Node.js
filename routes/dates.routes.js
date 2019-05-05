const express = require('express')
const router = express.Router()
const post = require('../models/post.model')


module.exports = router

router.get('/', async (req, res) => {
    const start = req.query.start
    const end = req.query.end
    await post.getDates(start,end)
    .then(post => res.json(post))
    .catch(err => {
        if (err.status) {
            res.status(err.status).json({ message: err.message })
        } else {
            res.status(500).json({ message: err.message })
        }
    })
})
