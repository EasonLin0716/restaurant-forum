# 餐廳論壇
使用這個餐廳論壇管理你喜愛的餐廳

## 預覽
![Cover](https://github.com/EasonLin0716/restaurant-forum/blob/master/previews/cover.JPG)

## 環境需求
1. Node.js
2. MySQL

## 安裝
1. 在終端機輸入
```
git clone https://github.com/EasonLin0716/restaurant-forum.git
```
2. 在 https://api.imgur.com/oauth2/addclient 註冊您的金鑰
3. 開啟專案，在根目錄中新增 .env 檔案，輸入：
```
IMGUR_CLIENT_ID=e6942d474a78cbd
```
4. 在根目錄中載入所需檔案：
```
npm install
```

## Dependencies
```
    "bcrypt-nodejs": "0.0.3",
    "body-parser": "^1.19.0",
    "connect-flash": "^0.1.1",
    "dotenv": "^8.2.0",
    "express": "^4.17.1",
    "express-handlebars": "^3.1.0",
    "express-session": "^1.17.0",
    "faker": "^4.1.0",
    "imgur-node-api": "^0.1.0",
    "method-override": "^3.0.0",
    "multer": "^1.4.2",
    "mysql2": "^2.0.0",
    "passport": "^0.4.0",
    "passport-local": "^1.0.0",
    "pg": "^7.12.1",
    "sequelize": "^5.21.2",
    "sequelize-cli": "^5.5.1"
```
