// 負責處理前台餐廳相關的 request
const db = require('../models')
const Restaurant = db.Restaurant
const Category = db.Category
let restController = {
  // 列出所有餐廳
  getRestaurants: (req, res) => {
    let whereQuery = {}
    let categoryId = ''
    if (req.query.categoryId) {
      categoryId = Number(req.query.categoryId)
      whereQuery['CategoryId'] = categoryId
    }
    Restaurant.findAll({ include: Category, where: whereQuery }).then(restaurants => {
      const data = restaurants.map(r => ({
        // 展開餐廳資料
        ...r.dataValues,
        description: `${r.dataValues.description.substring(0, 50)}...`
      }))
      Category.findAll().then(categories => { // 取出 categoies 
        return res.render('restaurants', {
          restaurants: data,
          categories,
          categoryId
        })
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