
## step 1 初使化環境

`mkdir project`
`cd porject`
`npm init`  ( entry point : server.js )
project / `touch server.js`



## step 2 使用 Express 建立本地伺服器和 Router

`npm i express --save`

```
路徑 : project / server.js 

const  express = require('express');
const  app = express();


const  user = require('./routes/user');

  
  
app.use('/user', user);

  
const  port = process.env.PORT || 5000;
app.listen(port, () => {
	console.log(`Server running on port ${port}`)
})
```

project / `mkdir routes`
project / `cd routes`
project / routes / `touch user.js`

```
路徑 : project / routes / user.js

const  express = require('express');
const  router = express.Router();

router.get('/test', (req, res) => {
	res.json({ msg:  'user works' });
});

module.exports = router
```
[啟動後測試 : http://localhost:5000/user/test](http://localhost:5000/user/test)

## step 3 連接 mongodb 資料庫

project / `npm i mongoose --save`
```
路徑 : project / server.js

const express = require('express');
const app = express();
<---------------------------------------------------------------------------------------------------------->
const mongoose = require('mongoose');
<---------------------------------------------------------------------------------------------------------->

const  user = require('./routes/user');

<---------------------------------------------------------------------------------------------------------->
mongoose.connect( '資料庫地址', { useNewUrlParser: true, useUnifiedTopology: true } )
	.then( () => console.log('Mongodb Connected') )
	.catch( err => console.log(err) )
<---------------------------------------------------------------------------------------------------------->


app.use('/user', user);

  
const  port = process.env.PORT || 5000;
app.listen(port, () => {
	console.log(`Server running on port ${port}`)
})
```

## step 4 使用 dotenv 套件將環境變數放在.env上

project / `npm i dotenv --save`

```
路徑 : project / server.js

const express = require('express');
const app = express();
const mongoose = require('mongoose')
<---------------------------------------------------------------------------------------------------------->
require('dotenv').config()
<---------------------------------------------------------------------------------------------------------->

const  user = require('./routes/user');

<---------------------------------------------------------------------------------------------------------->
mongoose.connect( process.env.MONGODBURL, { useNewUrlParser:  true, useUnifiedTopology:  true } )
<---------------------------------------------------------------------------------------------------------->
	.then( () => console.log('Mongodb Connected') )
	.catch( err => console.log(err) )

  
app.use('/user', user);

  
const  port = process.env.PORT || 5000;
app.listen(port, () => {
	console.log(`Server running on port ${port}`)
})
```
project / `touch .env`
```
路徑 : project / .env
MONGODBURL = '資料庫位置'
```

## step 5 建立使用者註冊"/register"路由

#### step 1 建立資料庫模型

project / `mkdir models`
project / `cd models`
project / models / `touch User.js`
```
路徑 : project / models / User.js

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
	name:{
		type : String,
		required : true
	},
	email:{
		type : String,
		required : true	
	},
	password:{
		type : String,
		required : true
	},
	date:{
		type : Date,
		default: Date.now	
	}		
})

module.exports = User = mongoose.model('users', UserSchema)
```
#### step 2 安裝 body-parser

project / `npm i body-parser --save`

```
路徑 : project / server.js

const express = require('express');
const app = express();
const mongoose = require('mongoose')
<---------------------------------------------------------------------------------------------------------->
const bodyParser = require('body-parser')
<---------------------------------------------------------------------------------------------------------->
require('dotenv').config()


const  user = require('./routes/user');


mongoose.connect( process.env.MONGODBURL, { useNewUrlParser:  true, useUnifiedTopology:  true } )
	.then( () => console.log('Mongodb Connected') )
	.catch( err => console.log(err) )

<---------------------------------------------------------------------------------------------------------->
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
<---------------------------------------------------------------------------------------------------------->

  
app.use('/user', user);

  
const  port = process.env.PORT || 5000;
app.listen(port, () => {
	console.log(`Server running on port ${port}`)
})
```

#### step 3  使用 bcrypt 套件，將存放於資料庫中的密碼行加密

project / `npm i bcrypt --save`
```
路徑 : project / routes / user.js 

const express = require('express'); 
const router = express.Router(); 
<---------------------------------------------------------------------------------------------------------->
const bcrypt = require('bcrypt');
<---------------------------------------------------------------------------------------------------------->

router.get('/test', (req, res) => {
	res.json({ msg: 'user works' });
}); 


module.exports = router
```

#### step 4  引入User Schema 並加入註冊路由
```
路徑 : project / routes / user.js
 
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
<---------------------------------------------------------------------------------------------------------->
const User = require('../models/User')
<---------------------------------------------------------------------------------------------------------->

router.get('/test', (req, res) => {
	res.json({ msg: 'user works' });
}); 

<---------------------------------------------------------------------------------------------------------->
router.post('/register', (req, res) => {
	// 查詢是否已經註冊過
	User.findOne({ email:  req.body.email })
		.then((user) => {
			if (user) { // 如果user存在
				return  res.status.json({ email:  "郵件已註冊過" })
			} else { // 如果user不存在，進行註冊動作
				const  newUser = new  User({
				name:  req.body.name,
				email:  req.body.email,
				password:  req.body.password
				})
				
				// 加密函式 (使用者密碼, 加鹽次數多越安全相對的加密時間就越長, callback)
				bcrypt.hash(newUser.password, 10, function (err, hash) {
					if (err) throw  err
					newUser.password = hash  // 將newUser.password 改為加密密碼
					newUser.save() // 將資訊存入mongodb
						.then(user  =>  res.json(user)) // 成功回傳
						.catch(err  =>  console.log(err)) // 錯誤回傳
				});
			}
		})
	})
<---------------------------------------------------------------------------------------------------------->

module.exports = router
```
 <font color=#FF6600>**postman測試**</font>
 
![01_postman測試註冊路由.png](https://github.com/js0731/JWT_Login_Verification/blob/master/record_img/01_postman%E6%B8%AC%E8%A9%A6%E8%A8%BB%E5%86%8A%E8%B7%AF%E7%94%B1.png?raw=true)

## step 6 建立使用者登入"/login"路由、使用 jwt 驗證機制

#### step 1 加入註冊"/login"路由，並使用 bcrypt.compare( ) 驗證加密密碼
```
路徑 : project / routes / user.js
 
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/User')


router.get('/test', (req, res) => {
	res.json({ msg: 'user works' });
}); 

router.post('/register', (req, res) => {
	// 查詢是否已經註冊過
	User.findOne({ email:  req.body.email })
		.then((user) => {
			if (user) { // 如果user存在
				return  res.status.json({ email:  "郵件已註冊過" })
			} else { // 如果user不存在，進行註冊動作
				const  newUser = new  User({
				name:  req.body.name,
				email:  req.body.email,
				password:  req.body.password
				})
				
				// 加密函式 (使用者密碼, 加鹽次數多越安全相對的加密時間就越長, callback)
				bcrypt.hash(newUser.password, 10, function (err, hash) {
					if (err) throw  err
					newUser.password = hash  // 將newUser.password 改為加密密碼
					newUser.save() // 將資訊存入mongodb
						.then(user  =>  res.json(user)) // 成功回傳
						.catch(err  =>  console.log(err)) // 錯誤回傳
				});
			}
		})
	})
<---------------------------------------------------------------------------------------------------------->
router.post('/login', (req,res) => {
	// 查詢資料庫
	User.findOne({email:req.body.email})
		.then(user => {
			if(!user){  // 如果沒有這個帳號
				return res.status(404).json({ email : "email不存在" })	
			}
			// 驗證加密密碼 (使用者輸入的密碼,  資料庫內的bcrypt密碼, callback)
			bcrypt.compare(req.body.password, user.password, (err, result) => { 
				 if (result) {  // 密碼比對為true
					 // 這段要返回一個token，先以json代替
					 res.json({ message: 'success' })
				 } else {       // 密碼比對為true
					 console.log(err);
					 return res.status(400).json({ password: '密碼錯誤' })
				 }
			 });		
		 })
	})

<---------------------------------------------------------------------------------------------------------->
module.exports = router
```
 <font color=#FF6600>**postman測試**</font>
 
![02_postman測試登入路由.PNG](https://github.com/js0731/JWT_Login_Verification/blob/master/record_img/02_postman%E6%B8%AC%E8%A9%A6%E7%99%BB%E5%85%A5%E8%B7%AF%E7%94%B1.PNG?raw=true)

#### step 2 使用 jwt 獲取 token 

project / `npm i jsonwebtoken --save`
```
路徑 : project / routes / user.js
 
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
<---------------------------------------------------------------------------------------------------------->
const jwt = require('jsonwebtoken');
<---------------------------------------------------------------------------------------------------------->
const User = require('../models/User')


router.get('/test', (req, res) => {
	res.json({ msg: 'user works' });
}); 

router.post('/register', (req, res) => {
	// 查詢是否已經註冊過
	User.findOne({ email:  req.body.email })
		.then((user) => {
			if (user) { // 如果user存在
				return  res.status.json({ email:  "郵件已註冊過" })
			} else { // 如果user不存在，進行註冊動作
				const  newUser = new  User({
				name:  req.body.name,
				email:  req.body.email,
				password:  req.body.password
				})
				
				// 加密函式 (使用者密碼, 加鹽次數多越安全相對的加密時間就越長, callback)
				bcrypt.hash(newUser.password, 10, function (err, hash) {
					if (err) throw  err
					newUser.password = hash  // 將newUser.password 改為加密密碼
					newUser.save() // 將資訊存入mongodb
						.then(user  =>  res.json(user)) // 成功回傳
						.catch(err  =>  console.log(err)) // 錯誤回傳
				});
			}
		})
	})

  
router.post('/login', (req,res) => {
	// 查詢資料庫
	User.findOne({email:req.body.email})
		.then(user => {
			if(!user){
				return res.status(404).json({ email : "email不存在" })	
			}
			// 加密函式 (使用者密碼, 加鹽次數多越安全相對的加密時間就越長, callback)
			bcrypt.compare(req.body.password, user.password, (err, result) => {
				 if (result) {  // 密碼比對為true
<---------------------------------------------------------------------------------------------------------->
					// 存放在jwt token的資料(不見得是要使用者資料)
					const payload = {  
						id : user.id,
						name : user.name,
						date : user.date	
					}
					// 產生token (存放資訊, 簽章, 過期時間, callback)
					jwt.sign( payload, process.env.SECRET, {expiresIn : 3600}, (err,token) => {  
						if(err) throw err
						res.json({
							success : true,
							token: 'Bearer ' + token	
						})
					})
<---------------------------------------------------------------------------------------------------------->
				 } else {  // 密碼比對為 false
					 console.log(err);
					 return res.status(400).json({ password: '密碼錯誤' })
				 }
			 });		
		 })
	})


module.exports = router
```
#### step 3 加上環境變數
```
路徑 : project / .env
MONGODBURL = '資料庫位置'
<---------------------------------------------------------------------------------------------------------->
SECRET = 'seccret'
<---------------------------------------------------------------------------------------------------------->
```

 <font color=#FF6600>**postman測試**</font>
 
![03_postman測試登入路由獲取token.PNG](https://github.com/js0731/JWT_Login_Verification/blob/master/record_img/03_postman%E6%B8%AC%E8%A9%A6%E7%99%BB%E5%85%A5%E8%B7%AF%E7%94%B1%E7%8D%B2%E5%8F%96token.PNG?raw=true)


## step 7 使用 passport 套件驗證 token 

#### step 1 引入 passport套件、passport-jwt驗證jwt策略套件 並初始化

project / `npm i passport passport-jwt --save`
```
路徑 : project / server.js
const  express = require('express');
const  app = express();
const  mongoose = require('mongoose');
require('dotenv').config()
const  bodyParser = require('body-parser')
<---------------------------------------------------------------------------------------------------------->
const  passport = require('passport');
<---------------------------------------------------------------------------------------------------------->
 
const  user = require('./routes/user');

mongoose.connect(process.env.MONGODBURL, { useNewUrlParser:  true, useUnifiedTopology:  true })
.then(() =>  console.log('Mongodb Connected'))
.catch(err  =>  console.log(err))

app.use(bodyParser.urlencoded({ extended:  true }))
app.use(bodyParser.json())
<---------------------------------------------------------------------------------------------------------->
app.use(passport.initialize())
// (passport)等同於在/porject/passport.js 引入上方的passport模組
require('./passport')(passport)
<---------------------------------------------------------------------------------------------------------->
  
  
app.use('/user', user);

  
const  port = process.env.PORT || 5000;
app.listen(port, () => {
	console.log(`Server running on port ${port}`)
})
```
 #### step2 設置passport
 

project / `touch passport.js`

```
路徑 : porject / passport.js
<---------------------------------------------------------------------------------------------------------->
const  JwtStrategy = require('passport-jwt').Strategy,
ExtractJwt = require('passport-jwt').ExtractJwt;
const  mongoose = require("mongoose");
const  User = mongoose.model("users");  


const  opts = {}
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();  // 獲取token
opts.secretOrKey = process.env.SECRET;  // 加密簽名
  
module.exports = passport  => {
	passport.use(new JwtStrategy(opts, (jwt_payload, done) => {
		//console.log(jwt_payload); // 用戶登入成功後 會取得jwt存放在payload的資料
		User.findById(jwt_payload.id) // 從jwt傳遞過來的使用者id找出是否有這個用戶
			.then(user  => {
				if (user) {
					return  done(null, user); // 驗證成功時就將資料傳入第二個參數
				}
				return  done(null, false);  // 驗證失敗就令第二個參數為 false
			})
			.catch(err  =>  console.log(err));
		}));
	}
<---------------------------------------------------------------------------------------------------------->
```

#### step 3 設置 router 加入 middleware 驗證 token 
```
路徑 : project / routes / user.js
 
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
<---------------------------------------------------------------------------------------------------------->
const  passport = require('passport');
<---------------------------------------------------------------------------------------------------------->
const User = require('../models/User')


router.get('/test', (req, res) => {
	res.json({ msg: 'user works' });
}); 

router.post('/register', (req, res) => {
	// 查詢是否已經註冊過
	User.findOne({ email:  req.body.email })
		.then((user) => {
			if (user) { // 如果user存在
				return  res.status.json({ email:  "郵件已註冊過" })
			} else { // 如果user不存在，進行註冊動作
				const  newUser = new  User({
				name:  req.body.name,
				email:  req.body.email,
				password:  req.body.password
				})
				
				// 加密函式 (使用者密碼, 加鹽次數多越安全相對的加密時間就越長, callback)
				bcrypt.hash(newUser.password, 10, function (err, hash) {
					if (err) throw  err
					newUser.password = hash  // 將newUser.password 改為加密密碼
					newUser.save() // 將資訊存入mongodb
						.then(user  =>  res.json(user)) // 成功回傳
						.catch(err  =>  console.log(err)) // 錯誤回傳
				});
			}
		})
	})

  
router.post('/login', (req,res) => {
	// 查詢資料庫
	User.findOne({email:req.body.email})
		.then(user => {
			if(!user){
				return res.status(404).json({ email : "email不存在" })	
			}
			// 加密函式 (使用者密碼, 加鹽次數多越安全相對的加密時間就越長, callback)
			bcrypt.compare(req.body.password, user.password, (err, result) => {
				 if (result) {  // 密碼比對為true
					// 存放在jwt token的資料(不見得是要使用者資料)
					const payload = {  
						id : user.id,
						name : user.name,
						date : user.date	
					}
					// 產生token (存放資訊, 簽章, 過期時間, callback)
					jwt.sign( payload, process.env.SECRET, {expiresIn : 3600}, (err,token) => {  
						if(err) throw err
						res.json({
							success : true,
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
	
<---------------------------------------------------------------------------------------------------------->
router.get('/information', passport.authenticate('jwt',{ session : false }), (req,res) => {
	res.json({ message:  '驗證成功' })
})
<---------------------------------------------------------------------------------------------------------->


module.exports = router
```
 <font color=#FF6600>**postman測試**</font>
 
![04_postman測試路由帶入token驗證.PNG](https://github.com/js0731/JWT_Login_Verification/blob/master/record_img/04_postman%E6%B8%AC%E8%A9%A6%E8%B7%AF%E7%94%B1%E5%B8%B6%E5%85%A5token%E9%A9%97%E8%AD%89.PNG?raw=true)



## step 8 建立 vue 專案，使用concurrently套件(前後端同時啟動)

#### step 1 建立 vue 專案

project /  `vue create client`

`-Manually select features  `
`-Babel , Router, Vuex  `
`-Use history mode for router ? Y or n`
`-In package.json`
```
路徑 : project / client / package.json

"scripts": {
	"serve": "vue-cli-service serve",
	"build": "vue-cli-service build",
<---------------------------------------------------------------------------------------------------------->
	"start":  "npm run serve" 
<---------------------------------------------------------------------------------------------------------->
},
```
#### step 2 使用concurrently套件，在 project/package.json 修改指令

project / `npm i concurrently --save`
```
路徑 : project / package.json
<---------------------------------------------------------------------------------------------------------->
"scripts": {
	"client-install":  "npm install --prefix client",
	"client":  "npm start --prefix client",
	"start":  "node server.js",
	"server":  "nodemon server.js",
	"dev":  "concurrently \"npm run server\" \"npm run client\""  
},
<---------------------------------------------------------------------------------------------------------->
```
project / `npm run dev`  (測試是否同時啟動)


#### step 3 刪除Client不必要文件與程式碼
`cd project`
`rm client/src/assets/logo.png`
`rm client/src/components/HelloWorld.vue`  
`rm client/src/views/About.vue`  
`rm client/src/views/Home.vue`  
`rm client/src/routes.js` 

#### step 4 刪除不必要程式碼
```
路徑 : project / client / src / router / index.js
<---------------------------------------------------------------------------------------------------------->
import  Vue  from  'vue'
import  VueRouter  from  'vue-router'

Vue.use(VueRouter)

const  routes = [

]

  
const  router = new  VueRouter({
	routes
})

export default router
<---------------------------------------------------------------------------------------------------------->
```

```
路徑 : project / client / src / App.js
<---------------------------------------------------------------------------------------------------------->
<template>
	<div  id="app">
		<router-view />
	</div>
</template>
<---------------------------------------------------------------------------------------------------------->
```
project / `npm run dev`  (測試是否同時啟動)


## step 9 加入 註冊、登陸、首頁、使用者資訊 的頁面

#### step 1 註冊頁面

project / client / src /views / `touch Register.vue`

```
路徑 : project / client / src / views / Register.vue
<---------------------------------------------------------------------------------------------------------->
<template>
	<form  class="reigsterForm"  action>
		<h1>使用者註冊</h1>
		<label  for="name">姓名</label>
		<input  type="text" />
		<label  for="email">電子郵件</label>
		<input  type="email" />
		<label  for="password">密碼</label>
		<input  type="password" />
		<button>註冊</button>
		<button>登入</button>
	</form>
</template>

<style>

.reigsterForm {
	width: 300px;
	display: flex;
	flex-direction: column;
	padding: 0  20px  40px;
	border: 1px  solid  black;
}
.reigsterForm  h1 {
	text-align: center;
}
.reigsterForm  label {
	margin: 5px  0;
}
.reigsterForm  input {
	font-size: 18px;
	height: 25px;
	padding-left: 10px;
}

.reigsterForm  button {
	color: white;
	font-size: 18px;
	margin-top: 20px;
	border: none;
	background: #576574;
	border-radius: 5px;
	padding: 5px  0;
}
.reigsterForm  button:hover {
	cursor: pointer;
}

</style>
<---------------------------------------------------------------------------------------------------------->
```

#### step 2 登入頁面

project / client / src /views / `touch Login.vue`
```
路徑 : project / client / src / views / Login.vue 

<template>
	<div>
		<form  class="loginForm"  action>
			<h1>使用者登入</h1>
			<label  for="email">電子郵件</label>
			<input  type="email" />
			<label  for="password">密碼</label>
			<input  type="password" />
			<button>註冊</button>
			<button>登入</button>
		</form>
	</div>
</template>

<style>

.loginForm {
	width: 300px;
	display: flex;
	flex-direction: column;
	padding: 0  20px  40px;
	border: 1px  solid  black;
}
.loginForm  h1 {
	text-align: center;
}
.loginForm  label {
	margin: 5px  0;
}
.loginForm  input {
	font-size: 18px;
	height: 25px;
	padding-left: 10px
}
.loginForm  button {
	color: white;
	font-size: 18px;
	margin-top: 20px;
	border: none;
	background: #576574;
	border-radius: 5px;
	padding: 5px  0;
}
.loginForm  button:hover {
	cursor: pointer;
}
</style>
```

#### step 3 首頁頁面
project / client / src / views / `touch Index.vue`
```
路徑 : project / client / src / views / Index.vue 

<template>
	<div>index</div>
</template>

<style>
</style>
```

#### step 4 使用者頁面

project / client / src / views / `touch User.vue`
```
路徑 : project / client / src /views / User.vue

<template>
	<div>user</div>
</template>

<style>
</style>
```

## step 10 加入 註冊、登入、首頁、使用者資訊 的路由、配置 App.vue 排版

#### step 1 加入路由

```
路徑 : project / client / src / router / index.js
<---------------------------------------------------------------------------------------------------------->
import  Vue  from  'vue'
import  VueRouter  from  'vue-router'
import  Register  from  '../views/Register'
import  Login  from  '../views/Login'
import  Index  from  '../views/Index'
import  User  from  '../views/User'
  
Vue.use(VueRouter)

  
const  routes = [
	{ path:  '/register', name:  'register', component:  Register },
	{ path:  '/login', name:  'login', component:  Login },
	{ path:  '/index', name:  'index', component:  Index },
	{ path:  '/user', name:  'user', component:  User },
]

const  router = new  VueRouter({
	mode:  'history',
	base:  process.env.BASE_URL,
	routes
})

  
export  default  router
<---------------------------------------------------------------------------------------------------------->
```
#### step 2 配置 App.vue css
```
路徑 : project / client / src /  App.vue

<template>
	<div  id="app">
		<router-view />
	</div>
</template>

<---------------------------------------------------------------------------------------------------------->
<style>
#app {
	width: 100vw;
	height: 80vh;
	display: flex;
	justify-content: center;
	align-items: center;
}
</style>
<---------------------------------------------------------------------------------------------------------->
```
[測試http://localhost:8080/index](http://localhost:8080/index)
[測試http://localhost:8080/user](http://localhost:8080/user)
[測試http://localhost:8080/register](http://localhost:8080/register)
[測試http://localhost:8080/login](http://localhost:8080/login)


##  step 11 實做 註冊、登入 功能，使用 axios 連接後端api 與 跨域 設定

#### step 1 安裝 axios

project / client `npm i axios --save`

```
路徑 : project / client / src / main.js

import  Vue  from  'vue'
import  App  from  './App.vue'
import  router  from  './router'
import  store  from  './store'
<---------------------------------------------------------------------------------------------------------->
import axios from  'axios';
<---------------------------------------------------------------------------------------------------------->

Vue.config.productionTip = false
<---------------------------------------------------------------------------------------------------------->
Vue.prototype.$axios = axios // 透過JS的prototype將自行定義的方法/物件直接掛上Vue的實體上，這樣在每個Vue組件中都可取用。
<---------------------------------------------------------------------------------------------------------->
new Vue({
   router,
   store,
   render:  h  =>  h(App)
}).$mount('#app')

```
#### step 2 配置跨域

project / client / `touch vue.config.js`

```
路徑 : project / client / vue.config.js

  module.exports = {  
	  devServer: {
		  open: true,
		  host: 'localhost',
		  port: 8080,
		  https: false,
		  // 以上的ip與埠為本機，下面為需要跨域的
			  proxy: {    //配置跨域
				  '/api': {
					  target: 'http://localhost:5000', // 連接的後端api
					  ws: true,  // 如果要代理websockets
					  changOrigin: true,//允许跨域
					  pathRewrite: {
						  '^/api': '' // 請求的時候用這個api就可以
					}
				}
			}
	   }
  }
```
#### step 3 實做註冊功能

```
路徑 : project / client / src / views / Register.vue

<template>
	<form  class="reigsterForm"  action>
		<h1>使用者註冊</h1>
<---------------------------------------------------------------------------------------------------------->
		<label  for="name">姓名</label>
		<input  v-model='registerUser.name' type="text" />
		<label  for="account">帳號</label>
		<input  v-model='registerUser.email' type="email" />
		<label  for="password">密碼</label>
		<input  v-model='registerUser.password' type="password" />
		<!-- form下的button 在沒有明確的給出type型別時，預設值為type=”submit”
			 如果該按鈕的作用不是為了提交表單的話，加上type屬性或是@click.prevent取消預設方法就行了設方法就行了-->
		<button @click.prevent="submitRegisterForm()">註冊</button>
		<button @click.prevent="toLogin()">登入</button>
<---------------------------------------------------------------------------------------------------------->
	</form>
</template>

<style>

.reigsterForm {
	width: 300px;
	display: flex;
	flex-direction: column;
	padding: 0  20px  40px;
	border: 1px  solid  black;
}
.reigsterForm  h1 {
	text-align: center;
}
.reigsterForm  label {
	margin: 5px  0;
}
.reigsterForm  input {
	font-size: 18px;
	height: 25px;
	padding-left: 10px;
}

.reigsterForm  button {
	color: white;
	font-size: 18px;
	margin-top: 20px;
	border: none;
	background: #576574;
	border-radius: 5px;
	padding: 5px  0;
}
.reigsterForm  button:hover {
	cursor: pointer;
}

</style>

<---------------------------------------------------------------------------------------------------------->
<script> 
export  default {
	data() {
		return {
			registerUser: {
				name:  "",
				email:  "",
				password:  "",
			},
		};
	},
	methods: {
		submitRegisterForm() {
			const  registerUserData = this.registerUser;
			this.$axios.post("/api/user/register", registerUserData) // 跨域路由加上'/api'
				.then((res) => {
					console.log(res);
					this.$router.push("/login");
				})
				.catch((err) => {
					console.log(err);
				});
			},
		toLogin() {
			this.$router.push("/login");
		}
	},
};
</script>
<---------------------------------------------------------------------------------------------------------->
```

[重啟後測試註冊功能http://localhost:8080/register](http://localhost:8080/register)

#### step 4 實做登入功能

```
路徑 : project / client / src / views / Login.vue 

<template>
	<div>
		<form  class="loginForm"  action>
			<h1>使用者登入</h1>
<----------------------------------------------------------------------------------------------------------->
			<label for="email">電子郵件</label>
			<input v-model='loginUser.email' type="email" />
			<label for="password.password">密碼</label>
			<input v-model='loginUser.password' type="password" />
			<button @click.prevent='toRegister()' >註冊</button>
			<button @click.prevent='submitLoginForm'>登入</button>
<----------------------------------------------------------------------------------------------------------->
		</form>
	</div>
</template>

<style>

.loginForm {
	width: 300px;
	display: flex;
	flex-direction: column;
	padding: 0  20px  40px;
	border: 1px  solid  black;
}
.loginForm  h1 {
	text-align: center;
}
.loginForm  label {
	margin: 5px  0;
}
.loginForm  input {
	font-size: 18px;
	height: 25px;
	padding-left: 10px
}
.loginForm  button {
	color: white;
	font-size: 18px;
	margin-top: 20px;
	border: none;
	background: #576574;
	border-radius: 5px;
	padding: 5px  0;
}
.loginForm  button:hover {
	cursor: pointer;
}
</style>

<----------------------------------------------------------------------------------------------------------->
<script>
	export  default {
		data() {
			return {
				loginUser: {
				email:  "",
				password:  "",
			},
		};
	},
	
	methods: {
		submitLoginForm() {
			const  loginUserData= this.loginUser;
			this.$axios.post("/api/user/login", loginUserData)
			.then((res) => {
				console.log(res);
				// 取出token
				const { token } = res.data;
				// 存儲到 localStorage
				localStorage.setItem('myToken', token);
				this.$router.push("/index");
			})
			.catch((err) => {
				console.log(err);
			});
		},
		toRegister() {
			this.$router.push("/register");
		},
	},
};
</script>
<----------------------------------------------------------------------------------------------------------->
```
[測試 : http://localhost:8080/login 登入後 localstorage 會出現 token](http://localhost:8080/login)



## step 12 路由守衛



```
路徑 : project / client / src / router / index.js

import  Vue  from  'vue'
import  VueRouter  from  'vue-router'

import  Register  from  '../views/Register'
import  Login  from  '../views/Login'
import  Index  from  '../views/Index'
import  User  from  '../views/User'
  
Vue.use(VueRouter)

  
const  routes = [
	{ path:  '/register', name:  'register', component:  Register },
	{ path:  '/login', name:  'login', component:  Login },
	{ path:  '/index', name:  'index', component:  Index },
	{ path:  '/user', name:  'user', component:  User },
]

const  router = new  VueRouter({
	mode:  'history',
	base:  process.env.BASE_URL,
	routes
})
<---------------------------------------------------------------------------------------------------------->
// to: 即將要進入的路由 from : 當前要離開的路由。 next(去哪的路由)
router.beforeEach( (to, from, next) => {
	const isLogin = localStorage.myToken ? true : false ; //查看localStorage token 是否存在
	if( to.path === '/login' || to.path === '/register' ){ // "/login"、"/register" 一律放行這兩個路由
		next();	
	}else{
		isLogin ? next() : next('/login') // 如果 localStorage token 不存在則導入/login頁面，存在則放行。
	}
})
<---------------------------------------------------------------------------------------------------------->
export  default  router

```
**測試把token刪除重新整理是否跳回/login**






##  step 13 使用 jwt-decode套件、解析 token 儲存到 vuex 中

#### step 1 解析 token
project / client `npm i jwt-decode --save`
```
路徑 : project / client / src / views / Login.vue 

<template>
	<div>
		<form  class="loginForm"  action>
			<h1>使用者登入</h1>
			<label for="email">電子郵件</label>
			<input v-model='loginUser.email' type="email" />
			<label for="password.password">密碼</label>
			<input v-model='loginUser.password' type="password" />
			<button @click.prevent='toRegister()' >註冊</button>
			<button @click.prevent='submitLoginForm()'>登入</button>
		</form>
	</div>
</template>

<style>

.loginForm {
	width: 300px;
	display: flex;
	flex-direction: column;
	padding: 0  20px  40px;
	border: 1px  solid  black;
}
.loginForm  h1 {
	text-align: center;
}
.loginForm  label {
	margin: 5px  0;
}
.loginForm  input {
	font-size: 18px;
	height: 25px;
	padding-left: 10px
}
.loginForm  button {
	color: white;
	font-size: 18px;
	margin-top: 20px;
	border: none;
	background: #576574;
	border-radius: 5px;
	padding: 5px  0;
}
.loginForm  button:hover {
	cursor: pointer;
}
</style>

<script>
<------------------------------------------------------------------------------------------------------->
import jwt_decode from 'jwt-decode'
<------------------------------------------------------------------------------------------------------->
	export  default {
		data() {
			return {
				loginUser: {
				email:  "",
				password:  "",
			},
		};
	},
	
	methods: {
		submitLoginForm() {
			const  loginUserData= this.loginUser;
			this.$axios.post("/api/user/login", loginUserData)
			.then((res) => {
				console.log(res);
				// 取出token
				const { token } = res.data;
				// 存儲到 localStorage
				localStorage.setItem('myToken', token);
<------------------------------------------------------------------------------------------------------->
				const decoded = jwt_decode(token); // 解析token
				console.log(decoded)
				this.$store.dispatch("setAuthenticated", !this.isEmpty(decoded));
				this.$store.dispatch("setUser", decoded);										         			       	 
<------------------------------------------------------------------------------------------------------->
				this.$router.push("/index");
			})
			.catch((err) => {
				console.log(err);
			});
		},
		toRegister() {
			this.$router.push("/register");
		},
<------------------------------------------------------------------------------------------------------->
		isEmpty(value) { // 空值為true 有值為false
		 return ( 
			 value === undefined || 
			 value === null || 
			 (typeof value === "object" && Object.keys(value).length === 0) || 
			 (typeof value === "string" && value.trim().length === 0) ); 
		},
<------------------------------------------------------------------------------------------------------->
	},
};
</script>

```

#### step 2 配置 vuex
```
路徑 : project / client / src / store / index.js
<------------------------------------------------------------------------------------------------------->
import  Vue  from  'vue'
import  Vuex  from  'vuex'

Vue.use(Vuex)

const  state = {
	isAuthenticated : false,  // 是否授權
	user:{}  // 用戶資訊
}

const  getters = {
	isAuthenticated : state => state.isAuthenticated,
	user : state => state.user
}

const  mutations = {
	SET_AUTHENTICATED(state, isAuthenticated){
		if(isAuthenticated) state.isAuthenticated = isAuthenticated 
		else state.isAuthenticated = false
	},
	SET_USER(state, user){
		if(user) state.user = user
		else state.user = {}
	}
}

const  actions = {
	setAuthenticated : ( {commit},isAuthenticated) => {
		commit('SET_AUTHENTICATED', isAuthenticated)
	},
	setUser : ({commit}, user) => {
		commit('SET_USER', user)
	}
}

export default new Vuex.Store({
	state,
	getters,
	mutations,
	actions
})
<------------------------------------------------------------------------------------------------------->
```


 
## step 14 從vuex中取出使用者資料在User.vue

#### step1 vuex 獲取 user 資訊 到首頁上
```
路徑 : project / client / src / views / Index.vue

<template>
	<div>
<-------------------------------------------------------------------------------------------------------->
		使用者id{{getUserData.id}}
		使用者名稱{{getUserData.name}}
		使用者創建日期{{getUserData.date}}
<-------------------------------------------------------------------------------------------------------->
	</div>
</template>

<-------------------------------------------------------------------------------------------------------->
<script>
	export  default {
		computed: {
			getUserData() {
				return  this.$store.getters.user;
			},
		},
	};
</script>>
<-------------------------------------------------------------------------------------------------------->
```

#### step 2 掛載到根組件 避免訊息因重新整理而遺失
```
路徑 : 
<template>
	<div id="app">
		<router-view />
	</div>
</template>

  
<style>
#app {
	width: 100vw;
	height: 80vh;
	display: flex;
	justify-content: center;
	align-items: center;
	font-family: 微軟正黑體;
}
</style>

<-------------------------------------------------------------------------------------------------------->
<script>
import jwt_decode from 'jwt-decode'
export default {
	name:'app',
	components:{},
	created(){
		if(localStorage.myToken){
		const decoded = jwt_decode(localStorage.myToken)
		// 將 token 儲存到 vuex 中
		this.$store.dispatch("setAuthenticated", !this.isEmpty(decoded));
		this.$store.dispatch( 'setUser', decoded );
		}
	},
	methods : {
		isEmpty(value){
			return (
				value === undefined || value === null ||
				(typeof value === 'object' && Object.keys(value).length === 0) ||
				(typeof value === 'string' && value.trim().length === 0)
			)
		}	
	}
}
</script>
<-------------------------------------------------------------------------------------------------------->
```
**測試登入後查看個人資料**

## step 15 配置 axios攔截，在首頁新增一個按鈕，驗證使用者的token是否過期或失效

####  step 1 配置 axios攔截
```
路徑 : project / client / src / main.js
import  Vue  from  'vue'
import  App  from  './App.vue'
import  router  from  './router'
import  store  from  './store'
import  axios  from  'axios';

<---------------------------------------------------------------------------------------------------------->
//請求發送攔截，把資料發送给後端之前做些什麼......
axios.interceptors.request.use(config => { 
	if (localStorage.myToken) { // 如果token存在
		config.headers.Authorization = localStorage.myToken; // 在http header都加上 token
		} 
	return config 
	}, error => { 
		return Promise.reject(error) 
	})
	
//請求返回攔截，把資料返回到頁面之前做些什麼...
axios.interceptors.response.use(response => {
	return response
}, err => {
		const { status } = err.response;
		if(status === 401){ // 用戶未認證
			console.log('token無效，請重新登錄');
			localStorage.removeItem('myToken');  // 清除token
			router.push('/login');  
		} 
		return Promise.reject(err)	
	})
<---------------------------------------------------------------------------------------------------------->
  
Vue.config.productionTip = false
Vue.prototype.$axios = axios

new  Vue({
	router,
	store,
	render:  h  =>  h(App)
}).$mount('#app')

```

#### step 2 在Index.vue新增一個驗證功能的按鈕
```
路徑 : project / client / src / views / Index.vue
<------------------------------------------------------------------------------------------------------->
<template>
	<div>
		<button  class="btn" @click="getInformation()">驗證token獲取資訊</button>
	</div>
</template>

<style>
	.btn {
		color: red;
		padding: 10px;
		border-radius: 5px; 
		font-size: 20px;
	}
	.btn:hover {
		cursor: pointer;
	}
	.btn:focus {
		outline: none;
	}
</style>

<script>
export  default {
methods: {
	getInformation() {
		this.$axios.get("/api/user/information")
			.then((res) => {
				console.log(res.data);
			})
			.catch((err) =>  console.log(err));
		},
	},
};
</script>
<------------------------------------------------------------------------------------------------------->
```
 <font color=#FF6600>**點擊api驗證成功**</font>
 
![05_前端測試按鈕驗證通過.PNG](https://github.com/js0731/JWT_Login_Verification/blob/master/record_img/05_%E5%89%8D%E7%AB%AF%E6%B8%AC%E8%A9%A6%E6%8C%89%E9%88%95%E9%A9%97%E8%AD%89%E9%80%9A%E9%81%8E.PNG?raw=true)

 <font color=#FF6600>**修改token 點擊api驗證失敗 跳回/login**</font>
 
![06_前端測試按鈕驗證失敗.PNG](https://github.com/js0731/JWT_Login_Verification/blob/master/record_img/06_%E5%89%8D%E7%AB%AF%E6%B8%AC%E8%A9%A6%E6%8C%89%E9%88%95%E9%A9%97%E8%AD%89%E5%A4%B1%E6%95%97.PNG?raw=true)
