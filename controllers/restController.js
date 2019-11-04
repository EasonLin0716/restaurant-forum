// 負責處理前台餐廳相關的 request
const db = require('../models')
const Restaurant = db.Restaurant
const Category = db.Category
let restController = {
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
}
module.exports = restController