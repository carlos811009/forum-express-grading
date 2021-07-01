const db = require('../models')
const helpers = require('../_helpers')
const Comment = db.Comment
const commentService = require('../services/commentService.js')

let CommentController = {
  postComment: (req, res) => {
    commentService.postComment(req, res, (data) => {
      if (data.status === 'success') {
        req.flash('success_messages', data.message)
        return res.redirect('back')
      }
    })
  },

  deleteComment: (req, res) => {
    commentService.deleteComment(req, res, (data) => {
      if (data.status === 'success') {
        req.flash('error_messages', data.message)
        return res.redirect('back')
      }
    })
  }

}

module.exports = CommentController