const passport = require("passport");
const LocalStrategy = require("passport-local");
const { Strategy: JwtStrategy, ExtractJwt} = require("passport-jwt");
const { Strategy: LinkedInStrategy } = require("passport-linkedin-oauth2");
const UserModel = require("./../database/models/user_model");

//The serializeUser() method stores information inside of our session relating to the passport user.
passport.serializeUser((user,done)=>{
    done(null, user._id);
});

//The deserializeUser() method gives us access to the information stored within the passport.
//user property of our session and allows us to return back data (in this case the user from the database)
// that will be appended to req.user.
passport.deserializeUser(async (id, done)=> {
    try {
        const user = await UserModel.findById(id);
        done(null, user);
    } catch(error){
        done(error);
    }
});

passport.use(new LocalStrategy({
    usernameField: "email"
},
    async (email, password, done) => {
        console.log(email, password, done);
        const user = await UserModel.findOne({ email })
        .catch(done);

        if (!user || !user.verifyPasswordSync(password)) {
        return done(null, false);
    }
    return done(null, user);
}
));

passport.use(new JwtStrategy(
    {
        jwtFromRequest: (req) => {
            let token = null;
            
            if (req && req.cookies) {
                token = req.cookies['jwt'];
            }

            return token;
        },
        secretOrKey: process.env.JWT_SECRET
    },
    async (jwt_payload, done) => {
        const user = await UserModel.findById(jwt_payload.sub)
            .catch(done);

        if (!user) {
            return done(null, false);
        }

        return done(null, user);
     }
));

passport.use(new LinkedInStrategy(
    {
        clientID: process.env.LINKEDIN_KEY,
        clientSecret: process.env.LINKEDIN_SECRET,
        callbackURL: "http://localhost:3000/auth/linkedin",
        scope: ['r_emailaddress', 'r_liteprofile'],
    }, async (accessToken, refreshToken, profile, done) {
        


        return done(null, profile);
    }
));