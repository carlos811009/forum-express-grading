const db = require('../models')
const Restaurant = db.Restaurant
const Category = db.Category

const restController = {
  getRestaurants: (req, res) => {
    Restaurant.findAll({
      raw: true,
      nest: true,
      include: [Category]
    })
      .then(restaurants => {
        const data = restaurants.map(each => {
          return {
            ...each,
            description: each.description.substring(0, 50),
            CategoryName: Category.name
          }
        })
        return res.render('restaurants', { restaurants: data })
      })
  },

  getRestaurant: (req, res) => {
    Restaurant.findByPk(req.params.id, {
      include: [Category]
    })
      .then(restaurant => {
        return res.render('restaurant', { restaurant: restaurant.toJSON() })
      })
  }
}
module.exports = restController