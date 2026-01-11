function getIndexPage(req, res) {
    const newUser = req.query.newUser === "true";
    res.render("index", { newUser });
}

function getSignUpPage(req, res) {
    res.render("sign-up");
}

function getLogInPage(req, res) {
    res.render("log-in");
}



export default {
    getIndexPage,
    getSignUpPage,
    getLogInPage,
};
