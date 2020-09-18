const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const User = require('../models/User')


router.get('/test', (req, res) => {
    res.json({ msg: 'user works' });
});

router.post('/register', (req, res) => {
    // 查詢是否已經註冊過
    User.findOne({ email: req.body.email })
        .then((user) => {
            if (user) { // 如果user存在
                console.log(user);
                return res.status.json({ email: "郵件已註冊過" })
            } else { // 如果user不存在，進行註冊動作
                const newUser = new User({
                    name: req.body.name,
                    email: req.body.email,
                    password: req.body.password
                })

                // 加密函式 (使用者密碼, 加鹽次數多越安全相對的加密時間就越長, callback)
                bcrypt.hash(newUser.password, 10, function (err, hash) {
                    if (err) throw err
                    newUser.password = hash  // 將newUser.password 改為加密密碼
                    newUser.save() // 將資訊存入mongodb
                        .then(user => res.json(user)) // 成功回傳
                        .catch(err => console.log(err)) // 錯誤回傳
                });
            }
        })
        .catch(err => console.log(err))
})


router.post('/login', (req, res) => {
    // 查詢資料庫
    User.findOne({ email: req.body.email })
        .then(user => {
            if (!user) {
                return res.status(404).json({ email: "email不存在" })
            }
            // 加密函式 (使用者密碼, 加鹽次數多越安全相對的加密時間就越長, callback)
            bcrypt.compare(req.body.password, user.password, (err, result) => {
                if (result) {  // 密碼比對為true

                    // 存放在jwt token的資料(不見得是要使用者資料)
                    const payload = {
                        id: user.id,
                        name: user.name,
                        date: user.date
                    }
                    // 產生token (存放資訊, 簽章, 過期時間, callback)
                    jwt.sign(payload, process.env.SECRET, { expiresIn: 3600 }, (err, token) => {
                        if (err) throw err
                        res.json({
                            success: true,
                            token: 'Bearer ' + token
                        })
                    })

                } else {  // 密碼比對為 false
                    console.log(err);
                    return res.status(400).json({ password: '密碼錯誤' })
                }
            });
        })
})

router.get('/information', passport.authenticate('jwt', { session: false }), (req, res) => {
    res.json({ message: '驗證成功' })
})

module.exports = router