# API REST Node.js + Express
Passo a passo para criar uma rest api em nodejs usando express e sem utilizar banco de dados.

### Contexto
A API tem como função facilitar o gerenciamento de horários de uma clínica, usará os seguintes métodos:
Criar (Cadastrar regras de horários para atendimento)    
Listar (Listar regras e horários disponíveis dado um intervalo de data)    
Deletar (Apagar regras)    


### Instalando os requisitos
Node.js e npm
```
$ sudo apt-get update
$ sudo apt-get install nodejs
$ sudo apt-get install npm
```
Verificando a instalação
```
$ node -v && npm -v
```
Iniciando o serviço
```
$ npm init
```
Instalação de pacotes
```
$ npm install express
$ npm install --save-dev morgan nodemon
$ npm install moment --save
```
### Criando nosso servidor
Vamos criar nosso _index.js_ declarando a instância do express e as funções de _parsing_ com nosso servidor rodando na porta 5000 conforme o conteúdo abaixo:
```js
const express = require('express')
const morgan = require('morgan')


const app = express()

app.use(morgan('tiny'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(require('./routes/index.routes'))

app.get('/', (req, res) => {
    res.json({ message: 'Hello world' })
})
app.listen('5000', () => {
  console.log('app is running');
});
```
Vamos adicionar o comando abaixo no _package.json_ para iniciar o servidor com o nodemon
```
"dev": "node_modules/.bin/nodemon -e js",
```
Para rodar nossa aplicação, execute o comando abaixo e então acesse no seu navegador o endereço: http://localhost:5000
```
$ npm run dev
```
E então teremos o famoso "Hello World" apresentado na rota principal.

### Criando nossa aplicação
Nossa estrutura de arquivos além dos arquivos padrões estará da seguinte forma:
```
└── helpers
    ├── helper.js
    └── middlewares.js
└── data
    └──posts.json
└── models
    └── post.model.js
└── routes
    ├── index.routes.js
    └── post.routes.js
```
#### data
Os dados em json vão seguir o seguinte padrão, podendo ter o campo dia ou não dependendo do tipo:
_posts.json_
```json
  {
    "id": "1",
    "tipo": "data específica",
    "dia": "2018-06-15",
    "intervalo": [
      {
        "de": "14:30",
        "até": "15:00"
      },
      {
        "de": "15:10",
        "até": "15:30"
      }
    ],
    "createdAt": "Mon Aug 27 2018 15:16:17 GMT+0200 (CEST)"
  },
```
#### helpers
Na pasta helper teremos os dois arquivos que irão auxiliar como funções para comunicação com o cliente: _middlewares.js_ e funções de manipulação para usar em nossos métodos http: _helper.js_.
A explicação sobre cada função segue nos comentários.

_middlewares.js_
```js
/* Verificar se o id inserido na url é um número inteiro*/
  function mustBeInteger(req, res, next) {
    const id = req.params.id
    if (!Number.isInteger(parseInt(id))) {
        res.status(400).json({ message: 'ID deve ser inteiro' })
    } else {
        next()
    }
}
/* Executar o método se o tipo e o intervalo forem inseridos como parâmetros*/
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
```
helper.js
```js
var moment = require('moment');

const fs = require('fs')
/*Geração automática do Id*/
const getNewId = (array) => {
    if (array.length > 0) {
        return array[array.length - 1].id + 1
    } else {
        return 1
    }
}
const newDate = () => new Date().toString()

/*Verificar qual o id nos dados é correspondente com o solicitado*/
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
/*Verificar se no intervalo de data inserido contém datas de consultas registradas*/
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
/*Fazer a tradução correta dos dados em json e salvar no arquivo de dados*/
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
```
#### models
Aqui teremos a declaração dos métodos que queremos contruir:
-    insertPost - criar regra
-    getPosts - listar todas as regras
-    getDates - listar horários disponíveis em um intervalo de data
-    deletePost - deletar regra

```js
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
    getDates,
    deletePost
}
```
#### routes
Vamos declarar nossa rota _post_ em _index.routes.js_:
```js
const express = require('express')
const router = express.Router()

module.exports = router
router.use('/api/v1/posts', require('./post.routes'))
```
Criando rotas em _post.routes.js_
```js
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

router.get('/interval', async (req, res) => {
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
```
Para testar se a API está funcionando, podemos usar Postman ou pela linha de comando no terminal:

- Criar regras:
```sh
curl --location --request POST "localhost:5000/api/v1/posts" \
  --header "Content-Type: application/json" \
  --data "  {
    \"id\": \"4\",
    \"tipo\": \"data específica\",
    \"dia\": \"2018-07-18\",
    \"intervalo\": [
      {
        \"de\": \"08:30\",
        \"até\": \"09:30\"
      },
      {
        \"de\": \"14:30\",
        \"até\": \"15:30\"
      }
    ]
  }"
 ```

- Listar regras registradas:
curl -i -X GET http://localhost:5000/api/v1/posts/
- Deletar regra:
curl -i -X DELETE http://localhost:5000/api/v1/posts/<id>
- Listar regras em um determinado intervalo de data:
curl --location --request GET "localhost:5000/api/v1/dates?start=2018-06-14&end=2018-06-16" \
  --header "Content-Type:  application/json"
