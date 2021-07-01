const imgur = require('imgur-node-api')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID
const helpers = require('../_helpers')
const db = require('../models')
const Restaurant = db.Restaurant
const Category = db.Category
const Comment = db.Comment
const User = db.User
const Favorite = db.Favorite
const Like = db.Like
const Followship = db.Followship

const commentController = {
  postComment: (req, res, callback) => {
    return Comment.create({
      text: req.body.text,
      RestaurantId: req.body.restaurantId,
      UserId: helpers.getUser(req).id
    })
      .then(() => {
        callback({ status: 'success', message: 'Successfully add comment' })
      })
  },

  deleteComment: (req, res, callback) => {
    return Comment.findByPk(req.params.id)
      .then((comment) => {
        comment.destroy()
          .then(() => {
            console.log('success')
            callback({ status: 'success', message: 'Comment Deleted' })
          })
      })
  }
}


module.exports = commentController