const db = require('../models')
const Category = db.Category
const adminService = require('../services/adminService.js')

let categoryController = {
  getCategories: (req, res) => {
    adminService.getCategories(req, res, (data) => {
      return res.render('admin/categories', data)
    })
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
    adminService.putCategory(req, res, (data) => {
      if (data.status === 'success') {
        req.flash('success_messages', data.message)
        return res.redirect('/admin/categories')
      }
      req.flash('error_messages', data.message)
      return res.redirect('/admin/categories')
    })
  },

  postCategory: (req, res) => {
    adminService.postCategory(req, res, (data) => {
      if (data.status === 'success') {
        req.flash('success_messages', data.message)
        return res.redirect('/admin/categories')
      }
      req.flash('error_messages', data.message)
      return res.redirect('/admin/categories')
    })
  }
}

module.exports = categoryController