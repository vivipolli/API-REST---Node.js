const express = require('express')
const router = express.Router()
const post = require('../models/post.model')
const m = require('../helpers/middlewares')

module.exports = router


router.get('/', async (req, res) => {
    await post.getPosts()
    .then(posts => res.json(posts))
    .catch(err => {
        if (err.status) {
            res.status(err.status).json({ message: err.message })
        } else {
            res.status(500).json({ message: err.message })
        }
    })
})

router.get('/:id', m.mustBeInteger, async (req, res) => {
    const id = req.params.id
    await post.getPost(id)
    .then(post => res.json(post))
    .catch(err => {
        if (err.status) {
            res.status(err.status).json({ message: err.message })
        } else {
            res.status(500).json({ message: err.message })
        }
    })
})


router.post('/', m.checkFieldsPost, async (req, res) => {
    await post.insertPost(req.body)
    .then(post => res.status(201).json({
        message: `post #${post.id} criado com sucesso`,
        content: post
    }))
    .catch(err => res.status(500).json({ message: err.message }))
})

router.delete('/:id', m.mustBeInteger, async (req, res) => {
    const id = req.params.id

    await post.deletePost(id)
    .then(post => res.json({
        message: `post #${id} deletado`
    }))
    .catch(err => {
        if (err.status) {
            res.status(err.status).json({ message: err.message })
        }
        res.status(500).json({ message: err.message })
    })
})
