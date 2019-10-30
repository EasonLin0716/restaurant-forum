// 負責處理前台餐廳相關的 request
let resController = {
  getRestaurants: (req, res) => {
    return res.render('restaurants')
  }
}

module.exports = resController