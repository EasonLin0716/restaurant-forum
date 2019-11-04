// 負責處理前台餐廳相關的 request
const db = require('../models')
const Restaurant = db.Restaurant
const Category = db.Category
let restController = {
  // 列出所有餐廳
  getRestaurants: (req, res) => {
    Restaurant.findAll({ include: Category }).then(restaurants => {
      const data = restaurants.map(r => ({
        // 展開餐廳資料
        ...r.dataValues,
        description: `${r.dataValues.description.substring(0, 50)}...`
      }))
      return res.render('restaurants', {
        restaurants: data
      })
    })
  },
  // 列出單一餐廳
  getRestaurant: (req, res) => {
    return Restaurant.findByPk(req.params.id, {
      include: Category
    }).then(restaurant => {
      return res.render('restaurant', {
        restaurant: restaurant
      })
    })
  }
}
module.exports = restController