const express = require('express')
const router = express.Router()

const restController = require('../controllers/restController.js')
const adminController = require('../controllers/adminController')
const userController = require('../controllers/userController')
const categoryController = require('../controllers/categoryController.js')
const commentController = require('../controllers/commentController.js')

const multer = require('multer')
const upload = multer({ dest: 'temp/' })

const passport = require('../config/passport')

const authenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next()
  }
  res.redirect('/signin')
}
const authenticatedAdmin = (req, res, next) => {
  if (req.isAuthenticated()) {
    if (req.user.isAdmin) { return next() }
    return res.redirect('/')
  }
  res.redirect('/signin')
}

router.get('/', authenticated, (req, res) => res.redirect('/restaurants')) // ok
router.get('/restaurants', authenticated, restController.getRestaurants) // ok
router.get('/restaurants/feeds', authenticated, restController.getFeeds) // ok
router.get('/restaurants/top', authenticated, restController.getTopRestaurants) // ok
router.get('/restaurants/:id', authenticated, restController.getRestaurant) // ok
router.get('/restaurants/:id/dashboard', authenticated, restController.getDashboard) // ok

router.post('/comments', authenticated, commentController.postComment)
router.delete('/comments/:id', authenticatedAdmin, commentController.deleteComment)

router.post('/favorite/:restaurantId', authenticated, userController.addFavorite) // ok
router.delete('/favorite/:restaurantId', authenticated, userController.removeFavorite) // ok
router.post('/like/:restaurantId', authenticated, userController.addLike) // ok
router.delete('/like/:restaurantId', authenticated, userController.removeLike) // ok

router.get('/admin', authenticatedAdmin, (req, res) => res.redirect('/admin/restaurants'))
router.get('/admin/restaurants', authenticatedAdmin, adminController.getRestaurants) // ok
router.get('/admin/restaurants/create', authenticatedAdmin, adminController.createRestaurant)
router.post('/admin/restaurants', authenticatedAdmin, upload.single('image'), adminController.postRestaurant) // ok
router.get('/admin/restaurants/:id', authenticatedAdmin, adminController.getRestaurant) // ok
router.get('/admin/restaurants/:id/edit', authenticatedAdmin, adminController.editRestaurant)
router.put('/admin/restaurants/:id', authenticatedAdmin, upload.single('image'), adminController.putRestaurant) // ok
router.delete('/admin/restaurants/:id', authenticatedAdmin, adminController.deleteRestaurant) // ok

router.get('/admin/users', authenticatedAdmin, adminController.editUsers)
router.put('/admin/users/:id', authenticatedAdmin, adminController.putUsers)

router.get('/admin/categories', authenticatedAdmin, categoryController.getCategories)
router.post('/admin/categories', authenticatedAdmin, categoryController.postCategory)
router.get('/admin/categories/:id', authenticatedAdmin, categoryController.getCategories)
router.put('/admin/categories/:id', authenticatedAdmin, categoryController.putCategory)
router.delete('/admin/categories/:id', authenticatedAdmin, categoryController.deleteCategory)

router.get('/signup', userController.signUpPage)
router.post('/signup', userController.signUp)

router.get('/signin', userController.signInPage)
router.post('/signin', passport.authenticate('local', { failureRedirect: '/signin', failureFlash: true }), userController.signIn)

router.get('/users/top', authenticated, userController.getTopUser) // ok
router.get('/users/:id', authenticated, userController.getUser) // ok
router.get('/users/:id/edit', authenticated, userController.editUser) // ok
router.put('/users/:id', authenticated, upload.single('image'), userController.putUser) // ok

router.post('/following/:userId', authenticated, userController.addFollowing) // ok
router.delete('/following/:userId', authenticated, userController.removeFollowing) // ok

router.get('/logout', userController.logout)

module.exports = router