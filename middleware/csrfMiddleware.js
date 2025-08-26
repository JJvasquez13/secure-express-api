const csrf = require("csurf");

const csrfProtection = csrf({
  cookie: {
    key: "XSRF-TOKEN",
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  },
  value: (req) => {
    return req.headers["x-xsrf-token"] || req.body._csrf || req.query._csrf;
  },
});

module.exports = csrfProtection;
