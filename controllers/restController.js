// 負責處理前台餐廳相關的 request
const db = require('../models')
const Comment = db.Comment
const User = db.User
const Restaurant = db.Restaurant
const Category = db.Category
const pageLimit = 10 // 每頁顯示幾筆資料

let restController = {
  // 列出所有餐廳
  getRestaurants: (req, res) => {
    let offset = 0 // 偏移量，從第 n+1 筆資料開始抓
    let whereQuery = {}
    let categoryId = ''
    if (req.query.page) {
      offset = (req.query.page - 1) * pageLimit
    }
    if (req.query.categoryId) {
      categoryId = Number(req.query.categoryId)
      whereQuery['CategoryId'] = categoryId
    }
    Restaurant.findAndCountAll({ include: Category, where: whereQuery, offset: offset, limit: pageLimit }).then(result => { // result: 餐廳的資料筆數
      // data for pagination
      let page = Number(req.query.page) || 1 // 目前頁面 當req.query.page未傳入就是1
      let pages = Math.ceil(result.count / pageLimit) // 頁數的最大值
      let totalPage = Array.from({ length: pages }).map((item, index) => index + 1) // 產生顯示頁數用的陣列
      let prev = page - 1 < 1 ? 1 : page - 1
      let next = page + 1 > pages ? pages : page + 1
      // clean up restaurant data
      const data = result.rows.map(r => ({
        ...r.dataValues,
        description: r.dataValues.description.substring(0, 50),
        isFavorited: req.user.FavoritedRestaurants.map(d => d.id).includes(r.id),
        isLiked: req.user.LikedRestaurants.map(d => d.id).includes(r.id)
      }))
      Category.findAll().then(categories => {
        return res.render('restaurants', {
          restaurants: data,
          categories,
          categoryId,
          page,
          totalPage,
          prev,
          next
        })
      })
    })
  },
  // 列出單一餐廳
  getRestaurant: (req, res) => {
    return Restaurant.findByPk(req.params.id, {
      include: [
        Category,
        { model: User, as: 'FavoritedUsers' },
        { model: User, as: 'LikedUsers' },
        { model: Comment, include: [User] }
      ]
    }).then(restaurant => {
      const isFavorited = restaurant.FavoritedUsers.map(d => d.id).includes(req.user.id)
      const isLiked = restaurant.LikedUsers.map(d => d.id).includes(req.user.id)
      restaurant.increment('viewCounts', { by: 1 })
      return res.render('restaurant', {
        restaurant,
        isFavorited,
        isLiked
      })
    })
  },
  getFeeds: (req, res) => {
    return Restaurant.findAll({
      limit: 10,
      order: [['createdAt', 'DESC']], // 依 createdAt 降冪排序
      include: [Category]
    }).then(restaurants => {
      Comment.findAll({
        limit: 10,
        order: [['createdAt', 'DESC']],
        include: [User, Restaurant]
      }).then(comments => {
        return res.render('feeds', {
          restaurants,
          comments
        })
      })
    })
  },
  getDashboard: (req, res) => {
    return Restaurant.findByPk(req.params.id, { include: [Category, Comment] })
      .then(restaurant => {

        res.render('dashboard', { restaurant })
      })
  }
}
module.exports = restController