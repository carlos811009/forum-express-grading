const fs = require('fs')
const imgur = require('imgur-node-api')
const helpers = require('../_helpers')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID
const bcrypt = require('bcryptjs')
const db = require('../models')
const User = db.User
const Like = db.Like
const Followship = db.Followship
const userService = require('../services/userService.js')

const userController = {
  signUpPage: (req, res) => {
    return res.render('signup')
  },

  signUp: (req, res) => {
    // confirm password
    if (req.body.passwordCheck !== req.body.password) {
      req.flash('error_messages', '兩次密碼輸入不同！')
      return res.redirect('/signup')
    } else {
      // confirm unique user
      User.findOne({ where: { email: req.body.email } }).then(user => {
        if (user) {
          req.flash('error_messages', '信箱重複！')
          return res.redirect('/signup')
        } else {
          User.create({
            name: req.body.name,
            email: req.body.email,
            password: bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10), null)
          }).then(user => {
            req.flash('success_messages', '成功註冊帳號！')
            return res.redirect('/signin')
          })
        }
      })
    }
  },
  signInPage: (req, res) => {
    return res.render('signin')
  },

  signIn: (req, res) => {
    req.flash('success_messages', '成功登入！')
    res.redirect('/restaurants')
  },

  logout: (req, res) => {
    req.flash('success_messages', '登出成功！')
    req.logout()
    res.redirect('/signin')
  },
  getUser: (req, res) => {
    userService.getUser(req, res, (data) => {
      return res.render('profile', data)
    })
  },
  editUser: (req, res) => {
    return User.findByPk(req.params.id)
      .then((user) => {
        return res.render('editProfile')
      })
  },
  putUser: (req, res) => {
    if (!req.body.name) {
      req.flash('error_messages', "name didn't exist")
      return res.redirect('back')
    }
    const { file } = req
    if (file) {
      imgur.setClientID(IMGUR_CLIENT_ID);
      imgur.upload(file.path, (err, img) => {
        return User.findByPk(req.params.id)
          .then((user) => {
            user.update({
              name: req.body.name,
              image: file ? img.data.link : user.image
            })
              .then((user) => {
                req.flash('success_messages', 'Profile was successfully to update')
                res.redirect(`/users/${user.id}`)
              })
          })
      })
    } else {
      return User.findByPk(req.params.id)
        .then((user) => {
          user.update({
            name: req.body.name,
            image: user.image
          })
            .then((user) => {
              req.flash('success_messages', 'Profile was successfully to update')
              res.redirect(`/users/${user.id}`)
            })
        })
    }
  },
  addFavorite: (req, res) => {
    userService.addFavorite(req, res, (data) => {
      if (data.status === 'success') {
        req.flash('success_messages', data.message)
        return res.redirect('back')
      }
    })
  },
  removeFavorite: (req, res) => {
    userService.removeFavorite(req, res, (data) => {
      if (data.status === 'success') {
        req.flash('error_messages', data.message)
        return res.redirect('back')
      }
    })
  },
  addLike: (req, res) => {
    userService.addLike(req, res, (data) => {
      if (data.status === 'success') {
        req.flash('success_messages', data.message)
        return res.redirect('back')
      }
    })
  },
  removeLike: (req, res) => {
    userService.removeLike(req, res, (data) => {
      if (data.status === 'success') {
        req.flash('error_messages', data.message)
        return res.redirect('back')
      }
    })
  },
  getTopUser: (req, res) => {
    userService.getTopUser(req, res, (data) => {
      return res.render('topUsers', data)
    })
  },
  addFollowing: (req, res) => {
    Followship.findOne({
      where: {
        followerId: helpers.getUser(req).id,
        followingId: req.params.userId
      }
    })
      .then(follow => {
        if (follow) {
          req.flash('error_messages', 'already Following')
          return res.redirect('back')
        } else {
          Followship.create({
            followerId: helpers.getUser(req).id,
            followingId: req.params.userId
          })
            .then(() => {
              req.flash('success_messages', 'Success Following')
              res.redirect('back')
            })
            .catch(err => console.log('addFollow error'))
        }
      })
  },
  removeFollowing: (req, res) => {
    Followship.findOne({
      where: {
        followerId: helpers.getUser(req).id,
        followingId: req.params.userId
      }
    })
      .then(follow => {
        follow.destroy()
        res.redirect('back')
      })
      .catch(err => console.log('remoteFollow error'))
  }
}

module.exports = userController