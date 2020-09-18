const JwtStrategy = require('passport-jwt').Strategy,
    ExtractJwt = require('passport-jwt').ExtractJwt;
const mongoose = require("mongoose");
const User = mongoose.model("users");


const opts = {}
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();  // 獲取token
opts.secretOrKey = process.env.SECRET;  // 加密簽名

module.exports = passport => {
    passport.use(new JwtStrategy(opts, (jwt_payload, done) => {
        //console.log(jwt_payload); // 用戶登入成功後 會取得jwt存放在payload的資料
        User.findById(jwt_payload.id) // 從jwt傳遞過來的使用者id找出是否有這個用戶
            .then(user => {
                if (user) {
                    return done(null, user); // 驗證成功時就將資料傳入第二個參數
                }
                return done(null, false);  // 驗證失敗就令第二個參數為 false
            })
            .catch(err => console.log(err));
    }));
}