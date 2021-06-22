const db = require('../models')
const Comment = db.Comment

let CommentController = {
  postComment: (req, res) => {
    return Comment.create({
      text: req.body.text,
      RestaurantId: req.body.restaurantId,
      UserId: req.user.id
    })
      .then(() => {
        res.redirect(`/restaurants/${req.body.restaurantId}`)
      })
  }

}

module.exports = CommentController