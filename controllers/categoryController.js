const db = require('../models')
const Category = db.Category
const adminService = require('../services/adminService.js')

let categoryController = {
  getCategories: (req, res) => {
    adminService.getCategories(req, res, (data) => {
      return res.render('admin/categories', data)
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
  }
}

module.exports = categoryController