const UserModel = require("./../database/models/user_model");

function interestsNew (req, res) {
    res.render("forms/interest_form");
}

async function interestsCreate(req, res) {
    
    let { userId } = req.params;
    let { interests } = req.body;

    await UserModel.findByIdAndUpdate(userId, {interests});


    res.redirect("/feed");
}


module.exports = {
    interestsNew,
    interestsCreate 
}