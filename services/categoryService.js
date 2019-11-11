const db = require('../models')
const Restaurant = db.Restaurant
const Category = db.Category

const categoryService = {
  getCategories: (req, res, callback) => {
    return Category.findAll().then(categories => {
      callback({ categories })
    })
  },
}

module.exports = categoryService