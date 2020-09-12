const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const morgan = require('morgan');
const cookieParser = require('cookie-parser');


app.use(morgan('dev'));
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));


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
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.send("Hello!");
});


app.get("/urls.json", (req, res) => {
    res.json(urlDatabase);
  });


app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});



app.get("/urls", (req, res) => {
    let templateVars = { urls: urlDatabase,username: req.cookies["username"], }; 
    res.render("urls_index", templateVars);
  });


app.get("/urls/new", (req, res) => {
    let templateVars = { username: req.cookies["username"]}
    res.render('urls_new',templateVars);
});



app.post("/urls", (req, res) => {
    const newShortURL = generateRandomString();

    urlDatabase[newShortURL] = req.body.longURL;
    console.log(newShortURL);
    res.redirect(`/urls/${newShortURL}`)
  });


app.get('/urls/:shortURL', (req, res) => {
  let templateVars = {shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL],username: req.cookies["username"]};
  res.render('urls_show', templateVars);
});


app.get('/u/:shortURL', (req, res) => {
  
  const longURLKey = req.params.shortURL;
  //console.log(req.params);
  let longURL = urlDatabase[longURLKey];
  res.redirect(longURL);
 
});


app.get('/urls/:shortURL/edit', (req, res) => {
    let templateVars = {shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]};
    console.log(req.params.shortURL);
   shortURL = req.params.shortURL;
   res.redirect(`/urls/${shortURL}`);
 });
 app.post('/urls/:shortURL/edit', (req, res) => {
   urlDatabase[req.params.shortURL] = req.body.longURL;
   res.redirect('/urls');
 });




app.get('/urls/:shortUrl/delete', (req, res) => {
    let templateVars = { username: req.cookies["username"]};
    res.render('urls_index', templateVars);});

app.post('/urls/:shortURL/delete', (req, res) => {
  console.log(urlDatabase[req.params.shortURL]);
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
});



app.post('/login', (req, res) => {
    res.cookie('username',JSON.stringify(req.body.username));
    console.log(JSON.stringify(req.body.username));
    res.redirect('/urls');
  });
  app.post('/logout', (req, res) => {
    res.clearCookie('username');
    res.redirect('/urls');
  });




app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});