const fs = require('fs')
const imgur = require('imgur-node-api')
const helpers = require('../_helpers')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID
const bcrypt = require('bcryptjs')
const db = require('../models')
const User = db.User
const Comment = db.Comment
const Restaurant = db.Restaurant
const Favorite = db.Favorite
const Like = db.Like
const Followship = db.Followship


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
    User.findByPk(req.params.id, {
      include: [
        { model: Comment, include: [Restaurant] },
        { model: User, as: 'Followers' },
        { model: User, as: 'Followings' },
        { model: Restaurant, as: 'FavoritedRestaurants' }
      ]
    })
      .then((user) => {
        const isUser = user.toJSON().id === helpers.getUser(req).id
        const commentCounts = user.toJSON().Comments.length
        const favoritedRestaurants = user.toJSON().FavoritedRestaurants.length
        const followingsCounts = user.toJSON().Followings.length
        const followersCounts = user.toJSON().Followers.length
        return res.render('profile', { user: user.toJSON(), isUser, commentCounts, favoritedRestaurants, followingsCounts, followersCounts })
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
    return Favorite.findOne({
      where: {
        RestaurantId: req.params.restaurantId,
        UserId: helpers.getUser(req).id
      }
    })
      .then(favorite => {
        if (favorite) {
          req.flash('error_messages', 'add to Favorite already')
          return res.redirect('back')
        } else {
          return Favorite.create({
            UserId: helpers.getUser(req).id,
            RestaurantId: req.params.restaurantId
          })
            .then(() => {
              req.flash('success_messages', 'Restaurant add to Favorite')
              res.redirect('back')
            })
            .catch(err => console.log('addFavorite error'))
        }
      })
  },
  removeFavorite: (req, res) => {
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
        req.flash('error_messages', 'Restaurant remove from Favorite')
        res.redirect('back')
      })
      .catch(err => console.log('remoteFavorite error'))
  },
  addLike: (req, res) => {
    Like.findOne({
      where: {
        UserId: helpers.getUser(req).id,
        RestaurantId: req.params.restaurantId
      }
    })
      .then(like => {
        if (like) {
          req.flash('error_messages', 'add to Like already')
          return res.redirect('back')
        } else {
          Like.create({
            UserId: helpers.getUser(req).id,
            RestaurantId: req.params.restaurantId
          })
            .then(() => {
              req.flash('success_messages', 'Restaurant add to Like')
              res.redirect('back')
            })
            .catch(err => console.log('addLike error'))
        }
      })
  },
  removeLike: (req, res) => {
    Like.findOne({
      where: {
        UserId: helpers.getUser(req).id,
        RestaurantId: req.params.restaurantId
      }
    })
      .then(like => {
        like.destroy()
        req.flash('error_messages', 'remove Like')
        res.redirect('back')
      })
      .catch(err => console.log('remoteLike error'))
  },
  getTopUser: (req, res) => {
    User.findAll({
      include: [
        { model: User, as: 'Followers' }
      ]
    })
      .then(users => {
        users = users.map(user => ({
          ...user,
          FollowerCount: user.Followers.length,
          isFollowed: helpers.getUser(req).Followings.map(d => d.id).includes(user.id)
        }))
        users = users.sort((a, b) => b.FollowerCount - a.FollowerCount)
        users = users.splice(0, 9)
        return res.render('topUsers', { users })
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