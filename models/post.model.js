let posts = require('../data/posts.json')
const filename = './data/posts.json'
const helper = require('../helpers/helper.js')



function insertPost(newPost) {
  return new Promise((resolve, reject) => {
    const id = { id: helper.getNewId(posts) }
    const date = {
        createdAt: helper.newDate()
    }
    newPost = { ...id, ...date, ...newPost }
    posts.push(newPost)
    helper.writeJSONFile(filename, posts)
    resolve(newPost)
  })
}
function getPosts() {
  return new Promise((resolve, reject) => {
        if (posts.length === 0) {
            reject({
                message: 'nenhum post',
                status: 202
            })
        }
        resolve(posts)
    })
}

function getPost(id) {
  return new Promise((resolve, reject) => {
    helper.mustBeInArray(posts, id)
    .then(post => resolve(post))
    .catch(err => reject(err))
  })
}

function getDates(start, end) {
  return new Promise((resolve, reject) => {
    helper.isBetweenDate(posts, start, end)
    .then(post => resolve(post))
    .catch(err => reject(err))
  })
}

function deletePost(id) {
  return new Promise((resolve, reject) => {
    helper.mustBeInArray(posts, id)
    .then(() => {
        posts = posts.filter(p => p.id !== id)
        helper.writeJSONFile(filename, posts)
        resolve()
    })
    .catch(err => reject(err))
})
}

module.exports = {
    insertPost,
    getPosts,
    getPost,
    getDates,
    deletePost
}
