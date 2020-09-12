const express = require ('express');
const app = express();
const PORT = 8080;
const bodyParser = require('body-parser');
const morgan = require('morgan');
const bcrypt = require('bcrypt');
const cookieSession = require('cookie-session');
const {getUserByEmail, generateRandomString, urlsForUser } = require('./helpers');
const passowrd1 = bcrypt.hashSync("purple-monkey-dinosaur", 10);
const passowrd2 = bcrypt.hashSync('dishwasher-funk', 10);

app.use(morgan('dev'));
app.use(cookieSession({
  name: 'session',
  keys: ['My secret key', 'My magic Key']
}));
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

const urlDatabase = { 
'b2xVn2': {longURL:'http://www.lighthouselabs.ca', id: "userRandomID"} ,
'9sm5xK': {longURL: 'http://www.google.com', id: "userRandomID"}
};

const users= {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: passowrd1
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: passowrd2
  }
};

//Used in the login 
function checkPassword (usersDatabase, passowrd) {
  for (const id in usersDatabase) {
    if (bcrypt.compareSync(passowrd, usersDatabase[id].password)){
    return true;
  }
}
  return false;
}




app.get('/', (req, res) => {
  if (req.session.id) {
    res.redirect("/urls");
  } else {
    res.redirect("/login"); 
  }
});

app.get("/urls", (req, res) => {
    const userDatabase = urlsForUser(urlDatabase, req.session.id);
    let templateVars = { urls: userDatabase,  userObj: users[req.session.id] };
    res.render("urls_index", templateVars);
});

app.get('/urls/new', (req, res) => {
  let templateVars = { userObj: users[req.session.id]}
  res.render('urls_new',templateVars);
});

app.post("/urls", (req, res) => {
  console.log(req.session.id);
  if (req.session.id) {
    const newShortURL = generateRandomString();
    urlDatabase[newShortURL] = {longURL: req.body.longURL, id: req.session.id};
    res.redirect(`/urls/${newShortURL}`);
  } else {
    res.send('<html><body><h3>Error: Please login to create a short link</h3></body></html>');
  }
  
});
app.get('/urls/:shortURL', (req, res) => {
  if (urlDatabase[req.params.shortURL]) {
    if (req.session.id === urlDatabase[req.params.shortURL].id) {
      let templateVars = {shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL,  userObj: users[req.session.id]};
      res.render('urls_show', templateVars);
    } else if (req.session.id !== urlDatabase[req.params.shortURL].id){
      res.send('<html><body><h3>Error: You can\'t access this page!!</h3></body></html>');
  }
} else {
    res.send('<html><body><h3>Error: This ShrotURL does not exist</h3></body></html>');
  }
 
});

app.get('/u/:shortURL', (req, res) => {
  const longURLKey = req.params.shortURL;
  if (urlDatabase[longURLKey]) {
    let longURL = urlDatabase[longURLKey].longURL;
    res.redirect(longURL);
  } else {
    res.send('<html><body><h3>Error: This ShrotURL does not exist</h3></body></html>')
  }
  
});

app.get('/urls/:shortURL/edit', (req, res) => {
   //let templateVars = {shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]};
   //console.log(req.params.shortURL);
   const userDatabase = urlsForUser(urlDatabase, req.session.id);
  shortURL = req.params.shortURL;
  if (userDatabase[shortURL]) {
    res.redirect(`/urls/${shortURL}`);
  } else {
    res.send('You can not edit this URL');
  }
  
});
app.post('/urls/:shortURL', (req, res) => {
  if (req.session.id) {
    const userDatabase = urlsForUser(urlDatabase, req.session.id);
    userDatabase[req.params.shortURL].longURL = req.body.longURL;
    res.redirect('/urls');
  } else {
    res.send('<html><body><h3>You can nott edit this Short link</h3></body></html>');
  }

});
app.get('/urls/:shortUrl/delete', (req, res) => {
  const userDatabase = urlsForUser(urlDatabase, req.session.id);
  let templateVars = {urls: userDatabase,  userObj: users[req.session.id] };
  if (userDatabase[req.body.shortURL]) {
    res.render('urls_index', templateVars);
  } else {
    res.send('<html><body><h3>You can not delete a link that you don\'t own!!!</h3></body></html>')
  }
  
});

app.post('/urls/:shortURL/delete', (req, res) => {
  const userDatabase = urlsForUser(urlDatabase, req.session.id);
  console.log('user', userDatabase[req.params.shortURL])
  if (userDatabase[req.params.shortURL]) {
      delete urlDatabase[req.params.shortURL];
      res.redirect('/urls');
  } else {
    res.send('<html><body><h3>You can not delete a link that you don\'t own!!!</h3></body></html>')
  }
});
app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/hello', (req, res) => {
  res.send('<html><body>Hello <b>World</b></body></html>\n');
});

app.get('/login', (req, res) => {
  let templateVars = { userObj: users[req.session.id]}
  res.render('login',templateVars);
});

app.post('/login', (req, res) => {
  const id = getUserByEmail(users,req.body.email);
  if (id) {
    if (checkPassword(users, req.body.password)){
      req.session.id = id;
      //console.log(req.body.email);
      res.redirect('/urls');
    } else {
      res.status(403).send('<html><body><h3>Password is not correct</h3></body></html>')
    }
   
  } else {
    res.status(403).send('<html><body><h3>This email does not exist in our database!</h3></body></html>')
  }
  
});
app.post('/logout', (req, res) => {
  //res.clearCookie('id');
  req.session = null;
  res.redirect('/urls');
});

app.get('/register', (req, res) => {
  let templateVars = { userObj: users[req.session.id]}
  res.render('register',templateVars);
});

app.post('/register', (req, res) => {
  if (req.body.email) {
    if (!(getUserByEmail(users, req.body.email))) {
      if (req.body.password) {
        const userId = generateRandomString();
        users[userId] = {id: userId, email: req.body.email, password: bcrypt.hashSync(req.body.password , 10)} ;
        req.session.id =  userId;
        res.redirect('/urls');
      } else {
        res.status(400).send('<html><body><h3>Please enter a password !!!</h3></body></html>')
      }
      
    } else {
      res.status(400).send('<html><body><h3>This email already exist in our database!</h3></body></html>')
    }
  
  } else {
    res.status(400).send('<html><body><h3>Please enter your email</h3></body></html>');
  }
  
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
  //console.log(generateRandomString());
});