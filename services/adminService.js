const imgur = require('imgur-node-api')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID
const db = require('../models')
const Restaurant = db.Restaurant
const Category = db.Category


const adminController = {
  getRestaurants: (req, res, callback) => {
    return Restaurant.findAll({ raw: true, nest: true, include: [Category] }).then(restaurants => {
      callback({ restaurants: restaurants })
    })
  },
  getRestaurant: (req, res, callback) => {
    return Restaurant.findByPk(req.params.id, { include: [Category] }).then(restaurant => {
      callback({ restaurant: restaurant.toJSON() })
    })
  },
  getCategories: (req, res, callback) => {
    Category.findAll({ raw: true })
      .then(categories => {
        if (req.params.id) {
          Category.findByPk(req.params.id)
            .then(category => {
              return res.render('admin/categories', {
                categories,
                category: category.toJSON()
              })
            })
        } else {
          callback({ categories })
        }
      })
  },
  deleteRestaurant: (req, res, callback) => {
    return Restaurant.findByPk(req.params.id)
      .then((restaurant) => {
        restaurant.destroy()
          .then((restaurant) => {
            callback({ status: 'success', message: 'restaurant deleted' })
          })
      })
  },
  postRestaurant: (req, res, callback) => {
    const { name, tel, address, opening_hours, description } = req.body
    if (!name) {
      callback({ status: 'error', message: "name didn't exist" })
    }
    const { file } = req
    if (file) {
      imgur.setClientID(IMGUR_CLIENT_ID);
      imgur.upload(file.path, (err, img) => {
        return Restaurant.create({
          name,
          tel,
          address,
          opening_hours,
          description,
          image: file ? img.data.link : null,
          CategoryId: req.body.categoryId
        }).then((restaurant) => {
          callback({ status: 'success', message: 'restaurant was successfully created' })
        })
      })
    } else {
      return Restaurant.create({
        name: req.body.name,
        tel: req.body.tel,
        address: req.body.address,
        opening_hours: req.body.opening_hours,
        description: req.body.description,
        image: null,
        CategoryId: req.body.categoryId
      }).then((restaurant) => {
        callback({ status: 'success', message: 'restaurant was successfully created' })
      })
    }
  },
  putRestaurant: (req, res, callback) => {
    const { name, tel, address, opening_hours, description } = req.body
    if (!name) {
      callback({ status: 'error', message: "name didn't exist" })
    }
    const { file } = req
    if (file) {
      imgur.setClientID(IMGUR_CLIENT_ID);
      imgur.upload(file.path, (err, img) => {
        return Restaurant.findByPk(req.params.id)
          .then((restaurant) => {
            restaurant.update({
              name,
              tel,
              address,
              opening_hours,
              description,
              image: file ? img.data.link : restaurant.image,
              CategoryId: req.body.categoryId
            }).then((restaurant) => {
              callback({ status: 'success', message: "restaurant was successfully to update" })
            })
          })
      })
    } else {
      return Restaurant.findByPk(req.params.id)
        .then((restaurant) => {
          restaurant.update({
            name,
            tel,
            address,
            opening_hours,
            description,
            image: restaurant.image,
            CategoryId: req.body.categoryId
          }).then((restaurant) => {
            callback({ status: 'success', message: "restaurant was successfully to update" })
          })
        })
    }
  },

  postCategory: (req, res, callback) => {
    if (req.body.category_name.trim() !== '') {
      return Category.create({
        name: req.body.category_name
      })
        .then((category) => {
          callback({ status: 'success', message: 'category was successfully created' })
        })
    }
    callback({ status: 'error', message: "name didn't exist" })
  },

  putCategory: (req, res, callback) => {
    Category.findByPk(req.params.id)
      .then((category) => {
        category.update({
          name: req.body.category_name
        }).then((restaurant) => {
          if (req.body.category_name.trim() !== '') {
            return callback({ status: 'success', message: 'category was successfully to update' })
          }
          callback({ status: 'error', message: "name didn't exist" })
        })
      })
  },

}


module.exports = adminController