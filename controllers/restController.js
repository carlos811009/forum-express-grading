const db = require('../models')
const Restaurant = db.Restaurant
const Category = db.Category
const Comment = db.Comment
const moment = require('moment')
const User = db.User
const pageLimit = 12
let offset = 0

const restController = {
  getRestaurants: (req, res) => {

    const whereQuery = {}
    let categoryId = ''
    if (req.query.page) {
      offset = Number(req.query.page - 1) * pageLimit
    }
    if (req.query.categoryId) {
      categoryId = Number(req.query.categoryId)
      whereQuery.CategoryId = categoryId
    }
    Restaurant.findAndCountAll({
      raw: true,
      nest: true,
      include: [Category],
      where: whereQuery,
      offset: offset,
      limit: pageLimit
      // where: { CategoryId: categoryId }
    })
      .then(result => {
        const page = Number(req.query.page) || 1
        const pages = Math.ceil(result.count / pageLimit)
        const totalPage = Array.from({ length: pages }).map((item, index) => { return index + 1 })
        const prev = page - 1 < 1 ? 1 : page - 1
        const next = page + 1 > pages ? pages : page + 1
        const data = result.rows.map(each => {
          return {
            ...each,
            description: each.description.substring(0, 50),
            CategoryName: Category.name
          }
        })
        Category.findAll({
          raw: true,
          nest: true,
        })
          .then(categories => {
            return res.render('restaurants',
              {
                restaurants: data,
                categories,
                categoryId,
                page,
                totalPage,
                prev,
                next
              })
          })
      })
  },

  getRestaurant: (req, res) => {
    Restaurant.findByPk(req.params.id, {
      include: [
        Category,
        { model: Comment, include: [User] }
      ]
    })
      .then(restaurant => {
        return res.render('restaurant', { restaurant: restaurant.toJSON() })
      })
  },

  getFeeds: (req, res) => {
    return Restaurant.findAll({
      raw: true,
      nest: true,
      include: [Category],
      order: [['createdAt', 'DESC']],
      limit: 10
    }).then(restaurants => {
      Comment.findAll({
        raw: true,
        nest: true,
        include: [User, Restaurant],
        order: [['createdAt', 'DESC']],
        limit: 10
      }).then(comments => {
        return res.render('feeds', {
          restaurants,
          comments
        })
      })
    })
  },

}
module.exports = restController