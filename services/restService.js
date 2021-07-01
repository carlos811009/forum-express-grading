const db = require('../models')
const helpers = require('../_helpers')
const Restaurant = db.Restaurant
const Category = db.Category
const Comment = db.Comment
const User = db.User
const moment = require('moment')
const pageLimit = 12
let offset = 0

const restController = {
  getRestaurants: (req, res, callback) => {
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
            description: each.description.substring(0, 30),
            CategoryName: Category.name,
            // isFavorited: helpers.getUser(req).Favorites.map(d => d.RestaurantId).includes(each.id)
            isFavorited: helpers.getUser(req).FavoritedRestaurants.map(F => F.id).includes(each.id),
            isLiked: helpers.getUser(req).LikedRestaurants.map(L => L.id).includes(each.id)
          }
        })
        Category.findAll({
          raw: true,
          nest: true,
        })
          .then(categories => {
            return callback({
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
  getRestaurant: (req, res, callback) => {
    Restaurant.findByPk(req.params.id, {
      include: [
        Category,
        { model: Comment, include: [User] },
        { model: User, as: 'FavoritedUsers' },
        { model: User, as: 'LikedUsers' }
      ]
    })
      .then(restaurant => {
        restaurant.viewCounts = Number(restaurant.viewCounts) + 1
        restaurant.save()
        const isFavorited = restaurant.FavoritedUsers.map(F => F.id).includes(helpers.getUser(req).id)
        const isLiked = restaurant.LikedUsers.map(L => L.id).includes(helpers.getUser(req).id)
        // restaurant.update({ viewCounts: viewCounts })
        //也可達成，但不清楚兩者實際上差異
        return callback({ restaurant: restaurant.toJSON(), isFavorited, isLiked })
      })
  },
  getFeeds: (req, res, callback) => {
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
      return callback({
        restaurants: restaurants,
        comments: comments
      })
    })
  },
  getDashboard: (req, res, callback) => {
    Restaurant.findByPk(req.params.id, {
      include: [Category,
        { model: Comment, include: [User] },
        { model: User, as: 'FavoritedUsers' }
      ]
    })
      .then(restaurant => {
        const favoriteCounts = restaurant.FavoritedUsers.length
        callback({ restaurant: restaurant.toJSON(), favoriteCounts })
        return res.render('dashboard', { restaurant: restaurant.toJSON(), favoriteCounts })
      })
  },
  getTopRestaurants: (req, res, callback) => {
    Restaurant.findAll({
      include: [
        Category,
        { model: User, as: 'FavoritedUsers' }
      ]
    })
      .then(restaurants => {
        restaurants = restaurants.map(r => (
          {
            ...r,
            id: r.id,
            Category: r.Category,
            description: r.description.substring(0, 50) || '',
            favoriteCounts: r.FavoritedUsers.length,
            isFavorited: helpers.getUser(req).FavoritedRestaurants.map(f => f.id).includes(r.id)
          }))
        restaurants = restaurants.sort((a, b) => b.favoriteCounts - a.favoriteCounts)
        restaurants = restaurants.splice(0, 9)
        return callback({ restaurants })
      })
  }
}


module.exports = restController