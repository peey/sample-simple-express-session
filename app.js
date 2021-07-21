const express = require ('express');
const session = require('express-session');

const app = express();

// Middleware
// express-session's documentation says cookie-parser is no longer needed
app.use(express.urlencoded({ extended: true })); // not required for sessions, but is needed to read POST 

app.use(session({
  secret: 'do not hide in the oven',
  saveUninitialized: false,
  resave: false,
  // rolling: false, // not required. setting rolling to true resets the expiry date every time the session info is requested (similar to .touch())
     cookie: { 
      // IMPORTANT: maxAge acts normal and refreshed on different browsers, while expires set here works universally preventing setting variables to the session once the time set in expires has passed. However, it acts normal when set together with a session var (details below).
      maxAge: 10 * 1000, // 10s
      // expires: new Date(Date.now() + (10 * 1000)),
        // On one hand express-session advises to use only the maxAge option.
        // On the other hand, max-age is not supported as widely as expires is.
      // httpOnly: false, // setting httpOnly to true makes the cookie visible via document.cookie command in the browser console
   },
}));

// This function manually calculates and logs the remaining age of a cookie. It should be called right next to the actual session variable
function expiryTimer(req) {
  const myInterval = setInterval(() => {
    let elapse = (Date.now() + req.session.cookie.maxAge) - Date.now();
    elapse = Math.floor(elapse / 1000);
    elapse >= 0 ? console.log(elapse) : clearInterval(myInterval);
  }, 1000);
}

// Routes
app.get('/', (req, res) => {
  if (!req.session.visitNo) {
    req.session.visitNo = 1;
  }
  res.send(`
        <p><a href="/json">see the JSON file</a></p>
        <p><strong id="visit-no">Visit Number </strong> ${req.session.visitNo}</p>
        <p><strong>The cookie as seen in the headers: </strong> ${req.headers.cookie ? req.headers.cookie : "none yet"}</p>
        <p><strong>Does session exist: </strong> ${req.session ? "yes" : "no"}</p>
        <p><strong>Does myVariable exist: </strong> ${req.session.myVariable ? "yes" : "no"}</p>
        <p><strong>What is the value of myVariable:</strong> ${req.session ? req.session.myVariable : "none yet"}</p>
        <p><strong>session ID:</strong> ${req.session ? req.session.id : "none yet"}</p>
        <p><strong>req.session.cookie.maxAge:</strong> ${req.session ? req.session.cookie.maxAge : "none yet"}</p>
        <p><strong>req.session.cookie.expires:</strong> ${req.session ? req.session.cookie.expires : "none yet"}</p>
        <p> maxAge and expires refresh every time, since they have a general purpose of assigning expiry age to any NEW cookie.</p>
        <p> The way express-session works makes it impossible to track the exact expiry date of a session variable. This data is normally retrieved from document.cookie. However, express-session completely encrypts the cookie thus inter alia hiding th's expiry date. Creation and Expiry dates are still accessible accessible for users via the button to the left of Chrome's address bar.
        <form method="GET" action="/process">
          <input type="text" name="text" value="lazy to type">
          <input type="submit" name="req" value="assign-a-value">
          <input type="submit" name="req" value="destroy-session">
        </form>
      `);
  req.session.visitNo = req.session.visitNo + 1;
  req.session.save();
});

app.get("/json", (req, res) => {
  res.json(req.session);
});

app.get('/process', (req, res) => {      
  let queryReq = req.query.req
  switch (queryReq) {
    case "assign-a-value":
      
      // Below is an alternative way to set expiry right before setting a session variable.
      // Note the 10s v 15s expiry time difference. the expiry will be changed to 15, but once 15s is expired, session's maxAge will restore its original value (10s).
      // req.session.cookie.maxAge = 10000;
      req.session.cookie.expires = new Date(Date.now() + 15000); // Unlike line 19, setting .expires here results to a rational behavior

      // SESSION VARIABLE ASSIGNED HERE
      req.session.myVariable = req.query.text;

      expiryTimer(req); // function from line 26 that logs the expiry time of a session cookie

      // Old Style Alternative      
      //res.cookie('cookie-name', 'content', { expires: new Date(Date.now() + 900000), httpOnly: true });
      // This creates unencrypted cookies
      
      res.redirect('/')
      break;

    case "destroy-session":
      req.session.destroy( err => {if (err) throw err})
      res.redirect('/')
      break;
  }
});

app.listen(3000, () => {
  console.log('\x1b[32m', '>>> Server URL: http://localhost:3000', '\x1b[0m');  
});