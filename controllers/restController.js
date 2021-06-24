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
            CategoryName: Category.name,
            isFavorited: req.user.FavoritedRestaurants.map(d => d.id).includes(each.id)
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
        { model: User, as: 'FavoritedUsers' },
        { model: Comment, include: [User] }
      ]
    })
      .then(restaurant => {
        let viewCounts = restaurant.toJSON().viewCounts || 0
        viewCounts++
        restaurant.viewCounts = viewCounts
        restaurant.save()
        const isFavorited = restaurant.FavoritedUsers.map(d => d.id).includes(req.user.id)
        // restaurant.update({ viewCounts: viewCounts })
        //也可達成，但不清楚兩者實際上差異
        return res.render('restaurant', { restaurant: restaurant.toJSON(), isFavorited })
      })
  },

  getFeeds: (req, res) => {
    return Promise.all([
      Restaurant.findAll({
        limit: 10,
        raw: true,
        nest: true,
        order: [['createdAt', 'DESC']],
        include: [Category]
      }),
      Comment.findAll({
        limit: 10,
        raw: true,
        nest: true,
        order: [['createdAt', 'DESC']],
        include: [User, Restaurant]
      })
    ]).then(([restaurants, comments]) => {
      return res.render('feeds', {
        restaurants: restaurants,
        comments: comments
      })
    })
  },

  getDashboard: (req, res) => {
    Restaurant.findByPk(req.params.id, {
      include: [Category, { model: Comment, include: [User] }]
    })
      .then(restaurant => {
        return res.render('dashboard', { restaurant: restaurant.toJSON() })
      })
  }
}
module.exports = restController