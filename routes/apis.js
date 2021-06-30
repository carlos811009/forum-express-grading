const express = require('express')
const router = express.Router()
const multer = require('multer')
const upload = multer({ dest: 'temp/' })

const adminController = require('../controllers/api/adminController.js')
const userController = require('../controllers/api/userController.js')

const passport = require('../config/passport')

const authenticated = passport.authenticate('jwt', { session: false })

const authenticatedAdmin = (req, res, next) => {
  if (req.user) {
    if (req.user.isAdmin) { return next() }
    return res.json({ status: 'error', message: 'permission denied' })
  } else {
    return res.json({ status: 'error', message: 'permission denied' })
  }
}


router.get('/admin/restaurants', authenticated, authenticatedAdmin, adminController.getRestaurants)
router.get('/admin/restaurants/:id', authenticated, authenticatedAdmin, adminController.getRestaurant)
router.get('/admin/categories', authenticated, authenticatedAdmin, adminController.getCategories)
router.delete('/admin/restaurants/:id', authenticated, authenticatedAdmin, adminController.deleteRestaurant)
router.post('/admin/restaurants', authenticated, authenticatedAdmin, upload.single('image'), adminController.postRestaurant)
router.put('/admin/restaurants/:id', authenticated, authenticatedAdmin, upload.single('image'), adminController.putRestaurant)
router.post('/admin/categories', authenticated, authenticatedAdmin, adminController.postCategory)
router.put('/admin/categories/:id', authenticated, authenticatedAdmin, adminController.putCategory)
router.delete('/admin/categories/:id', authenticated, authenticatedAdmin, adminController.deleteCategory)

router.post('/signin', userController.signIn)
router.post('/signup', userController.signUp)

router.get('/users/:id', userController.getUser)

module.exports = router