var moment = require('moment');

const fs = require('fs')
const getNewId = (array) => {
    if (array.length > 0) {
        return array[array.length - 1].id + 1
    } else {
        return 1
    }
}
const newDate = () => new Date().toString()


function mustBeInArray(array, id) {
    return new Promise((resolve, reject) => {
        const row = array.find(r => r.id == id)
        if (!row) {
            reject({
                message: 'ID incorreto',
                status: 404
            })
        }
        resolve(row)
    })
}
function isBetweenDate(array, start, end){
    return new Promise((resolve, reject) => {
        const pertain =  array.find(r => moment(r.dia).isBetween(start, end, 'months','day'))
        if (!pertain) {
            reject({
                message: 'Não há data disponível nesse intervalo',
                status: 404
            })
        }
        resolve(pertain)
    })
}

function writeJSONFile(filename, content) {
    fs.writeFileSync(filename, JSON.stringify(content,null,2), 'utf8', (err) => {
        if (err) {
            console.log(err)
        }
    })
}
module.exports = {
    getNewId,
    newDate,
    mustBeInArray,
    isBetweenDate,
    writeJSONFile
}
