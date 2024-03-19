// Importar as dependências
const express = require('express');
const app = express();
const session = require('express-session');
const bodyParser = require('body-parser');

// Configura o motor de visualização EJS
app.set('view engine', 'ejs');

// Middleware para analisar corpos de solicitação
app.use(bodyParser.urlencoded({ extended: true }));

// Middleware que serve os arquivos estáticos para o Express
app.use(express.static('public'));

// Configuração do express-session
app.use(session({
  secret: 'secret-key',
  resave: false,
  saveUninitialized: true
}));

// Array de objetos contendo os dados dos usuários
let users = [
    {name: "ADMIN", email: "admin@gmail.com", password: "admin"},
    {name: "Jorivaldo", email: "jorivaldo@gmail.com", password: "just"},
    {name: "Leo", email: "leo@gmail.com", password: "moraes"},
    {name: "Mycael", email: "mycael@gmail.com", password: "allsol"}
];

// Rota para página inicial
app.get('/', (req, res) => {
    req.session.currentUser = null;
    renderIndex(req, res);
});

// Rota para logout
app.get('/logout', (req, res) => {
    // Destroi a sessão ao fazer logout
    req.session.destroy(() => {
      res.clearCookie('connect.sid1');
      res.redirect('/');
    });
});

// Rota para a página home
app.get('/home', (req, res) => {
    if (req.session.currentUser && req.session.currentUser.email === "admin@gmail.com") {
        res.render('admin', { users: users, systemMessage: req.session.systemMessage });
    } else {
        if (req.session.currentUser) {
            res.render('home', { currentUser: req.session.currentUser, systemMessage: req.session.systemMessage });
        } else {
            req.session.systemMessage = "Por favor, faça login para acessar esta página.";
            res.redirect('/');
        }
    }
    req.session.systemMessage = null; // Limpa a mensagem de sistema após renderizar a página
});

// Rota para o registro de usuários
app.get('/register', (req, res) => {
    renderRegister(req, res);
});

// Rota para exclusão de usuários
app.get('/delete/:name', (req, res) => {
    let name = req.params.name;
    if (name !== "ADMIN") {
        users = users.filter(user => user.name !== name);
        res.redirect('/home');
    } else {
        req.session.systemMessage = "Não é possível deletar o Administrador";
        res.redirect('/home');
    }
});

// Rota para visualizar todos os cookies definidos
app.get('/cookies', (req, res) => {
  res.send(req.cookies);
});

// Rota para login de usuários
app.post('/login', (req, res) => {
    let { email, password } = req.body;
    let user = users.find(user => user.email === email && user.password === password);

    if (user) {
        req.session.currentUser = user;
        res.redirect('/home');
    } else {
        req.session.systemMessage = "Usuário e/ou senha inválidos."
        res.redirect('/');
    }
});

// Rota para registro de usuários
app.post('/register', (req, res) => {
    let { name, email, password, confirmPassword } = req.body;
    let verifyEmail = users.some(user => user.email === email);

    if (password === confirmPassword) {
        if (!verifyEmail) {
            const newUser = { name, email, password };
            users.push(newUser);
            req.session.currentUser = newUser;
            res.redirect('/home');
        } else {
            req.session.systemMessage = "Esse email já está cadastrado!";
            res.redirect('/register');
        }
    } else {
        req.session.systemMessage = "O password e o Confirm Password estão diferentes!";
        res.redirect('/register');
    }
});

// Função para renderizar a página index
function renderIndex(req, res) {
    res.render('index', { systemMessage: req.session.systemMessage });
    req.session.systemMessage = null;
}

// Função para renderizar a página de registro
function renderRegister(req, res) {
    res.render('register', { systemMessage: req.session.systemMessage });
    req.session.systemMessage = null;
}

const port = 3000;
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
