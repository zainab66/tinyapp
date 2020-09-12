//returns the id of a user by knowing the email of the user
function getUserByEmail(usersDatabase, email) {
    for (const id in usersDatabase) {
      if (usersDatabase[id].email === email) {
        return id;
      }
    }
  }
  
  // used in generating id for the shortURL and the users
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
  
  //Gives the set of URLs for certain user 
  function urlsForUser(urlDatabase, id) {
    const partialDatabase = {}
    for (const key in urlDatabase) {
      if(urlDatabase[key].id === id) {
        partialDatabase[key] = urlDatabase[key]
      }
    }
    return partialDatabase;
  }
  
  module.exports = { getUserByEmail, generateRandomString, urlsForUser};