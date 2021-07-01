const bcrypt = require('bcryptjs')
const db = require('../models')
const User = db.User

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
    userService.editUser(req, res, (data) => {
      return res.render('editProfile', data)
    })
  },
  putUser: (req, res) => {
    userService.putUser(req, res, (data) => {
      if (data.status === 'error') {
        req.flash('error_message', data.message)
        return res.redirect('back')
      }
      req.flash('success_message', data.message)
      console.log(data.user.dataValues.id)
      // return res.redirect('back')
      return res.redirect(`/users/${data.user.dataValues.id}`)
    })
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
      console.log(data)
      return res.render('topUsers', data)
    })
  },
  addFollowing: (req, res) => {
    userService.addFollowing(req, res, (data) => {
      if (data.status === 'success') {
        req.flash('success_messages', data.message)
        return res.redirect('back')
      }
    })
  },
  removeFollowing: (req, res) => {
    userService.removeFollowing(req, res, (data) => {
      req.flash('error_messages', data.message)
      res.redirect('back')
    })
  }
}

module.exports = userController