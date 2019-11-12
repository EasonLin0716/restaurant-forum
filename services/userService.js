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
  getUser: (req, res, callback) => {
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
      const addedId = new Set() // 儲存已評論的餐廳id
      user.Comments.map(comment => {
        // comment 取得的 restaurant
        const restaurant = comment.dataValues.Restaurant.dataValues
        // 如果餐廳已存在(被評論過就不會放進 commentedRestaurant )
        if (addedId.has(restaurant.id)) return;
        addedId.add(restaurant.id)
        commentedRestaurant.push(restaurant)
      })
      return callback({
        user,
        currentUserId: req.user.id,
        commentedRestaurant
      })
    })
  },

  editUser: (req, res, callback) => {
    const currentUser = req.user.id
    return User.findByPk(req.params.id).then(user => {
      // 若當前使用者不是本人，則導回首頁
      if (user.id !== currentUser) return res.redirect('/')
      return callback({ user, currentUser })
    })
  },

  putUser: (req, res, callback) => {
    if (!req.body.name) {
      return callback({ status: 'error', message: 'name didn\'t exist' })
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
                return callback({ status: 'success', message: 'user was successfully to update' })
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
              return callback({ status: 'success', message: 'user was successfully to update' })
            })
        })
  },
  addFavorite: (req, res, callback) => {
    return Favorite.create({
      UserId: req.user.id,
      RestaurantId: req.params.restaurantId
    })
      .then((restaurant) => {
        return callback({ status: 'success', message: '' })
      })
  },

  removeFavorite: (req, res, callback) => {
    return Favorite.findOne({
      where: {
        UserId: req.user.id,
        RestaurantId: req.params.restaurantId
      }
    })
      .then((favorite) => {
        favorite.destroy()
          .then((restaurant) => {
            return callback({ status: 'success', message: '' })
          })
      })
  },

  addLike: (req, res, callback) => {
    return Like.create({
      UserId: req.user.id,
      RestaurantId: req.params.restaurantId
    })
      .then((restaurant) => {
        return callback({ status: 'success', message: '' })
      })
  },

  removeLike: (req, res, callback) => {
    const query = {
      where: {
        UserId: req.user.id,
        RestaurantId: req.params.restaurantId
      }
    }
    return Like.findOne(query)
      .then(like => like.destroy())
      .then(() => { return callback({ status: 'success', message: '' }) })
  },

  getTopUser: (req, res, callback) => {
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
      return callback({ users, currentUserId })
    })
  },

  addFollowing: (req, res, callback) => {
    return Followship.create({
      followerId: req.user.id,
      followingId: req.params.userId
    })
      .then((followship) => {
        return callback({ status: 'success', message: '' })
      })
  },

  removeFollowing: (req, res, callback) => {
    return Followship.findOne({
      where: {
        followerId: req.user.id,
        followingId: req.params.userId
      }
    })
      .then((followship) => {
        followship.destroy()
          .then((followship) => {
            return callback({ status: 'success', message: '' })
          })
      })
  }
}

module.exports = userController