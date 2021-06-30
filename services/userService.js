const imgur = require('imgur-node-api')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID
const helpers = require('../_helpers')
const db = require('../models')
const Restaurant = db.Restaurant
const Category = db.Category
const Comment = db.Comment
const User = db.Category
const Favorite = db.Favorite
const Like = db.Like

const userController = {
  getUser: (req, res, callback) => {
    User.findByPk(req.params.id, {
      include: [
        { model: Comment, include: [Restaurant] },
        { model: User, as: 'Followers' },
        { model: User, as: 'Followings' },
        { model: Restaurant, as: 'FavoritedRestaurants' }
      ]
    })
      .then((user) => {
        const isUser = helpers.getUser(req).id === user.id
        const commentCounts = user.Comments.length
        const favoritedRestaurants = user.FavoritedRestaurants.length
        const followingsCounts = user.Followings.length
        const followersCounts = user.Followers.length
        const isFollowed = user.Followers.map(f => f.id).includes(helpers.getUser(req).id)
        callback({ user1: user.toJSON() })
        // callback({ user1: user.toJSON(), isUser, commentCounts, favoritedRestaurants, followingsCounts, followersCounts, isFollowed })
      })
  },
  addFavorite: (req, res, callback) => {
    return Favorite.findOne({
      where: {
        RestaurantId: req.params.restaurantId,
        UserId: helpers.getUser(req).id
      }
    })
      .then(favorite => {
        return Favorite.create({
          UserId: helpers.getUser(req).id,
          RestaurantId: req.params.restaurantId
        })
          .then(() => {
            return callback({ status: 'success', message: "Restaurant add to Favorite" })
          })
          .catch(err => console.log(err))

      })
  },
  removeFavorite: (req, res, callback) => {
    return Favorite.findOne({
      where: {
        RestaurantId: req.params.restaurantId,
        UserId: helpers.getUser(req).id
      }
    })
      .then(favorite => {
        favorite.destroy()
      })
      .then(() => {
        return callback({ status: 'success', message: 'Restaurant remove from Favorite' })
        // res.redirect('back')
      })
      .catch(err => console.log(err))
  },
  addLike: (req, res, callback) => {
    Like.findOne({
      where: {
        UserId: helpers.getUser(req).id,
        RestaurantId: req.params.restaurantId
      }
    })
      .then(like => {
        Like.create({
          UserId: helpers.getUser(req).id,
          RestaurantId: req.params.restaurantId
        })
          .then(() => {
            return callback({ status: 'success', message: "Restaurant add to Like" })
          })
          .catch(err => console.log(err))

      })
  },
  removeLike: (req, res, callback) => {
    Like.findOne({
      where: {
        UserId: helpers.getUser(req).id,
        RestaurantId: req.params.restaurantId
      }
    })
      .then(like => {
        like.destroy()
        return callback({ status: 'success', message: 'remove Like' })
      })
      .catch(err => console.log('remoteLike error'))
  },
}


module.exports = userController