const bcrypt = require('bcrypt-nodejs')
const db = require('../models')
const User = db.User
const Comment = db.Comment
const Restaurant = db.Restaurant
const fs = require('fs')
const imgur = require('imgur-node-api')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID


const userController = {
  signUpPage: (req, res) => {
    return res.render('signup')
  },

  signUp: (req, res) => {
    // confirm password
    if (req.body.passwordCheck !== req.body.password) {
      req.flash('error_messages', '兩次密碼輸入不同！')
      return res.redirect('/signup')
    } else {
      // confirm unique user
      User.findOne({ where: { email: req.body.email } }).then(user => {
        if (user) {
          req.flash('error_messages', '信箱重複！')
          return res.redirect('/signup')
        } else {
          User.create({
            name: req.body.name,
            email: req.body.email,
            password: bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10), null)
          }).then(user => {
            req.flash('success_messages', '成功註冊帳號！')
            return res.redirect('/signin')
          })
        }
      })
    }
  },
  signInPage: (req, res) => {
    return res.render('signin')
  },

  signIn: (req, res) => {
    req.flash('success_messages', '成功登入！')
    res.redirect('/restaurants')
  },

  logout: (req, res) => {
    req.flash('success_messages', '登出成功！')
    req.logout()
    res.redirect('/signin')
  },

  getUser: (req, res) => {
    const currentUser = req.user.id // 驗證是否為當前使用者，決定給予 edit 連結與否
    return User.findByPk(req.params.id, { include: [Comment] }).then(user => {
      const commentAmount = user.dataValues.Comments.length // 評論筆數
      const commentedRestaurant = [] // 被評論過的餐廳資料

      user.dataValues.Comments.map( // 透過 Comment 中 RestaurantId 取得餐廳照片
        data => Restaurant.findByPk(data.dataValues.RestaurantId)
          .then(restaurant => {
            const restaurantData = {}
            restaurantData.id = restaurant.dataValues.id
            restaurantData.name = restaurant.dataValues.name
            restaurantData.image = restaurant.dataValues.image
            commentedRestaurant.push(restaurantData)
          })
      )

      return res.render('user', { user, currentUser, commentAmount, commentedRestaurant })
    })
  },

  editUser: (req, res) => {
    const currentUser = req.user.id
    return User.findByPk(req.params.id).then(user => {
      // 若當前使用者不是本人，則導回首頁
      if (user.id !== currentUser) return res.redirect('/')
      return res.render('editUser', { user, currentUser })
    })
  },

  putUser: (req, res) => {
    if (!req.body.name) {
      req.flash('error_messages', "name didn't exist")
      return res.redirect('back')
    }

    const { file } = req
    if (file) {
      imgur.setClientID(IMGUR_CLIENT_ID);
      imgur.upload(file.path, (err, img) => {
        return User.findByPk(req.params.id)
          .then((user) => {
            user.update({
              name: req.body.name,
              image: file ? img.data.link : user.image,
            })
              .then((user) => {
                req.flash('success_messages', 'user was successfully to update')
                res.redirect(`/users/${user.id}`)
              })
          })
      })
    }
    else
      return User.findByPk(req.params.id)
        .then((user) => {
          restaurant.update({
            name: req.body.name,
            image: restaurant.image
          })
            .then((user) => {
              req.flash('success_messages', 'user was successfully to update')
              res.redirect(`/users/${user.id}`)
            })
        })
  },
}

module.exports = userController