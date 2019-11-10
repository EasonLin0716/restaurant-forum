const bcrypt = require('bcrypt-nodejs')
const db = require('../models')
const User = db.User
const Comment = db.Comment
const Restaurant = db.Restaurant
const Favorite = db.Favorite
const Like = db.Like
const Followship = db.Followship
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
    return User.findByPk(req.params.id, {
      include: [
        Comment,
        { model: Comment, include: [Restaurant] },
        { model: User, as: 'Followers' },
        { model: User, as: 'Followings' },
        { model: Restaurant, as: 'FavoritedRestaurants' },
      ]
    }).then(user => {
      user = user.dataValues
      user.isFollowed = req.user.Followings.map(d => d.id).includes(user.id)
      const commentedRestaurant = [] // 被評論過的餐廳資料
      const addedCommentedRestaurantId = [] // 儲存已評論的餐廳id
      user.Comments.map(comment => {
        // comment 取得的 restaurant
        const restaurant = comment.dataValues.Restaurant.dataValues

        // 如果餐廳已存在(被評論過就不會放進 commentedRestaurant )
        if (!addedCommentedRestaurantId.includes(restaurant.id)) {
          // 取出需要的資訊並存入 commentedRestaurant
          commentedRestaurant.push(restaurant)
          addedCommentedRestaurantId.push(restaurant.id)
        }

      })
      return res.render('user/profile',
        {
          user,
          currentUserId: req.user.id,
          commentedRestaurant
        })
    })
  },

  editUser: (req, res) => {
    const currentUser = req.user.id
    return User.findByPk(req.params.id).then(user => {
      // 若當前使用者不是本人，則導回首頁
      if (user.id !== currentUser) return res.redirect('/')
      return res.render('user/edit', { user, currentUser })
    })
  },

  putUser: (req, res) => {
    if (!req.body.name) {
      req.flash('error_messages', "name didn't exist")
      return res.redirect('back')
    }

    const { file } = req
    // 如果有上傳圖片
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
      // 如果沒上傳圖片
      return User.findByPk(req.params.id)
        .then((user) => {
          user.update({
            name: req.body.name,
          })
            .then((user) => {
              req.flash('success_messages', 'user was successfully to update')
              res.redirect(`/users/${user.id}`)
            })
        })
  },
  addFavorite: (req, res) => {
    return Favorite.create({
      UserId: req.user.id,
      RestaurantId: req.params.restaurantId
    })
      .then((restaurant) => {
        return res.redirect('back')
      })
  },

  removeFavorite: (req, res) => {
    return Favorite.findOne({
      where: {
        UserId: req.user.id,
        RestaurantId: req.params.restaurantId
      }
    })
      .then((favorite) => {
        favorite.destroy()
          .then((restaurant) => {
            return res.redirect('back')
          })
      })
  },

  addLike: (req, res) => {
    return Like.create({
      UserId: req.user.id,
      RestaurantId: req.params.restaurantId
    })
      .then((restaurant) => {
        return res.redirect('back')
      })
  },

  removeLike: (req, res) => {
    const query = {
      where: {
        UserId: req.user.id,
        RestaurantId: req.params.restaurantId
      }
    }
    return Like.findOne(query)
      .then(like => like.destroy())
      .then(() => res.redirect('back'))
  },

  getTopUser: (req, res) => {
    return User.findAll({
      include: [
        { model: User, as: 'Followers' }
      ]
    }).then(users => {
      users = users.map(user => ({
        ...user.dataValues,
        FollowerCount: user.Followers.length,
        isFollowed: req.user.Followings.map(d => d.id).includes(user.id)
      }))
      users = users.sort((a, b) => b.FollowerCount - a.FollowerCount)
      const currentUserId = req.user.dataValues.id // 檢查是否本人，若是就不給追蹤鈕
      return res.render('topUser', { users, currentUserId })
    })
  },

  addFollowing: (req, res) => {
    return Followship.create({
      followerId: req.user.id,
      followingId: req.params.userId
    })
      .then((followship) => {
        return res.redirect('back')
      })
  },

  removeFollowing: (req, res) => {
    return Followship.findOne({
      where: {
        followerId: req.user.id,
        followingId: req.params.userId
      }
    })
      .then((followship) => {
        followship.destroy()
          .then((followship) => {
            return res.redirect('back')
          })
      })
  }
}

module.exports = userController