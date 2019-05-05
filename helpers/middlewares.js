function mustBeInteger(req, res, next) {
    const id = req.params.id
    if (!Number.isInteger(parseInt(id))) {
        res.status(400).json({ message: 'ID deve ser inteiro' })
    } else {
        next()
    }
}
function checkFieldsPost(req, res, next) {
    const { tipo, intervalo } = req.body
    if (tipo && intervalo) {
        next()
    } else {
        res.status(400).json({ message: 'tipo e intervalo são obrigatórios' })
    }
}
module.exports = {
    mustBeInteger,
    checkFieldsPost
}
