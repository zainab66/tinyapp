const express = require ('express');
const app = express();
const PORT = 8080;
const bodyParser = require('body-parser');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

app.use(morgan('dev'));

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
//app.set('view engine', 'ejs');
app.set("view engine", "ejs");

function generateRandomString() {
  const  shortURLLength = 6
  let genertatedShortURL = '';
  for (let i = 0; i <= shortURLLength; i ++ ) {
    const randomInput = Math.floor(Math.random() * 3);
    if (randomInput === 0) {
      genertatedShortURL += Math.floor(Math.random() * 10); //generat a random number from 0 to 9
    } else if (randomInput === 1) {
      genertatedShortURL += String.fromCharCode((Math.floor(Math.random() * 26)) + 97); //generate a random letter a to z
    } else {
      genertatedShortURL += String.fromCharCode((Math.floor(Math.random() * 26)) + 65); //generate a random letter A to Z
    }
  }
  return genertatedShortURL;
}


const urlDatabase = { 
'b2xVn2': {longURL:'http://www.lighthouselabs.ca', id: "userRandomID"} ,
'9sm5xK': {longURL: 'http://www.google.com', id: "userRandomID"}
};

const users= {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

function checkEmail(email) {
  for (const id in users) {
    console.log(users[id].email, email );
    if (users[id].email === email) {
      return id;
    }
  }
}

function checkPassword (passowrd) {
  for (const id in users) {
    if (users[id].password === passowrd)
    return true;
  }
  return false;
}


function urlsForUser(id) {
  const partialDatabase = {}
  for (const key in urlDatabase) {
    if(urlDatabase[key].id === id) {
      partialDatabase[key] = urlDatabase[key]
    }
  }
  console.log('Mypartial', partialDatabase);
  return partialDatabase;
}

app.get('/', (req, res) => {
  res.send('Hello');
});

app.get("/urls", (req, res) => {
  console.log('id',req.cookies['id']);
  const userDatabase = urlsForUser(req.cookies['id']);
  let templateVars = { urls: userDatabase,  userObj: users[req.cookies["id"]] };
  //console.log(templateVars);
  res.render("urls_index", templateVars);
});

app.get('/urls/new', (req, res) => {
  let templateVars = { userObj: users[req.cookies["id"]]}
  res.render('urls_new',templateVars);
});

app.post("/urls", (req, res) => {
  const newShortURL = generateRandomString();
  //urlDatabase[newShortURL] = req.body.longURL;
  urlDatabase[newShortURL] = {longURL: req.body.longURL, id: req.cookies['id']};
  console.log(urlDatabase);
  res.redirect(`/urls/${newShortURL}`)
});
app.get('/urls/:shortURL', (req, res) => {
  let templateVars = {shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL,  userObj: users[req.cookies["id"]]};
  console.log('long',urlDatabase[req.params.shortURL].longURL);
  res.render('urls_show', templateVars);
});

app.get('/u/:shortURL', (req, res) => {
  const longURLKey = req.params.shortURL;
  //console.log(req.params);
  let longURL = urlDatabase[longURLKey].longURL;
  res.redirect(longURL);
});

app.get('/urls/:shortURL/edit', (req, res) => {
   //let templateVars = {shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]};
   //console.log(req.params.shortURL);
   const userDatabase = urlsForUser(req.cookies['id']);
  shortURL = req.params.shortURL;
  if (userDatabase[shortURL]) {
    res.redirect(`/urls/${shortURL}`);
  } else {
    res.send('You can not edit this URL');
  }
  
});
app.post('/urls/:shortURL/edit', (req, res) => {
  const userDatabase = urlsForUser(req.cookies['id']);
  console.log('edit', userDatabase[req.params.shortURL])
  userDatabase[req.params.shortURL].longURL = req.body.longURL;
  res.redirect('/urls');
});
app.get('/urls/:shortUrl/delete', (req, res) => {
  const userDatabase = urlsForUser(req.cookies['id']);
  let templateVars = {urls: userDatabase,  userObj: users[req.cookies["id"]] };
  if (userDatabase[req.body.shortURL]) {
    res.render('urls_index', templateVars);
  } else {
    res.send('<html><body><h3>You can not delete a link that you don\'t own!!!</h3></body></html>')
  }
  
});

app.post('/urls/:shortURL/delete', (req, res) => {
  const userDatabase = urlsForUser(req.cookies['id']);
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
  let templateVars = { userObj: users[req.cookies["id"]]}
  res.render('login',templateVars);
});

app.post('/login', (req, res) => {
  const id = checkEmail(req.body.email);
  if (id) {
    if (checkPassword(req.body.password)){
      res.cookie('id',id);
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
  res.clearCookie('id');
  res.redirect('/urls');
});

app.get('/register', (req, res) => {
  let templateVars = { userObj: users[req.cookies["id"]]}
  res.render('register',templateVars);
});

app.post('/register', (req, res) => {
  if (req.body.email) {
    if (!(checkEmail(req.body.email))) {
      const userId = generateRandomString();
      users[userId] = {id: userId, email: req.body.email, password: req.body.password} ;
      res.cookie('id', userId);
      res.redirect('/urls');
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