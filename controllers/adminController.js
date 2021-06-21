const fs = require('fs')
const imgur = require('imgur-node-api')
const IMGUR_CLIENT_ID = '123bd070ac75920'
const db = require('../models')
const Restaurant = db.Restaurant
const User = db.User
const Category = db.Category

const adminController = {
  getRestaurants: (req, res) => {
    return Restaurant.findAll({ raw: true, nest: true, include: [Category] }).then(restaurants => {
      return res.render('admin/restaurants', { restaurants: restaurants })
    })
  },
  createRestaurant: (req, res) => {
    Category.findAll({
      raw: true,
      nest: true
    }).then(categories => {
      return res.render('admin/create', {
        categories: categories
      })
    })
  },
  postRestaurant: (req, res) => {
    const { name, tel, address, opening_hours, description } = req.body
    if (!name) {
      req.flash('error_messages', "name didn't exist")
      return res.redirect('back')
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
          req.flash('success_messages', 'restaurant was successfully created')
          return res.redirect('/admin/restaurants')
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
        req.flash('success_messages', 'restaurant was successfully created')
        return res.redirect('/admin/restaurants')
      })
    }
  },
  getRestaurant: (req, res) => {
    return Restaurant.findByPk(req.params.id, { include: [Category] }).then(restaurant => {
      return res.render('admin/restaurant', {
        restaurant: restaurant.toJSON()
      })
    })
  },
  editRestaurant: (req, res) => {
    Category.findAll({
      raw: true,
      nest: true
    }).then(categories => {
      return Restaurant.findByPk(req.params.id).then(restaurant => {
        return res.render('admin/create', {
          categories: categories,
          restaurant: restaurant.toJSON()
        })
      })
    })
  },
  putRestaurant: (req, res) => {
    const { name, tel, address, opening_hours, description } = req.body
    if (!name) {
      req.flash('error_messages', "name didn't exist")
      return res.redirect('back')
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
              req.flash('success_messages', 'restaurant was successfully to update')
              res.redirect('/admin/restaurants')
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
            req.flash('success_messages', 'restaurant was successfully to update')
            res.redirect('/admin/restaurants')
          })
        })
    }
  },
  deleteRestaurant: (req, res) => {
    return Restaurant.findByPk(req.params.id)
      .then((restaurant) => {
        restaurant.destroy()
          .then((restaurant) => {
            req.flash('success_messages', 'restaurant deleted')
            res.redirect('/admin/restaurants')
          })
      })
  },
  getUsers: (req, res) => {
    return User.findAll({ raw: true })
      .then(users => {
        return res.render('admin/users', { users })
      })
  },
  toggleAdmin: (req, res) => {
    return User.findByPk(req.params.id)
      .then(user => {
        const { name, email, password } = user.toJSON()
        if (user.toJSON().isAdmin) {
          user.update({ name, email, password, isAdmin: false })
        } else {
          user.update({ name, email, password, isAdmin: true })
        }
      })
      .then(() => {
        req.flash('success_messages', '權限修改成功')
        res.redirect('/admin/users')
      })
  },
  getCategories: (req, res) => {
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
          return res.render('admin/categories', { categories, })
        }
      })
  },
  postCategories: (req, res) => {
    return Category.create({
      name: req.body.category_name
    })
      .then(() => res.redirect('/admin/categories'))
  },
  deleteCategory: (req, res) => {
    return Category.findByPk(req.params.id)
      .then(category => category.destroy()
        .then(() => {
          req.flash('success_messages', 'category Deleted')
          res.redirect('/admin/categories')
        }))
  },
  putCategory: (req, res) => {
    Category.findByPk(req.params.id)
      .then((category) => {
        category.update({
          name: req.body.category_name
        }).then((restaurant) => {
          req.flash('success_messages', 'category was successfully to update')
          res.redirect('/admin/categories')
        })
      })
  },

}
module.exports = adminController