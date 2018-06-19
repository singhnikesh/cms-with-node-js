'use strict';
var express = require('express');
var router = express.Router();
const authenticateMiddleware = require('../models/authenticateMiddleware');

/* GET home page. */
router.get('/index', authenticateMiddleware.notAllowAnonymous('student'), function (req, res) {
    res.render('account/index', { 
        metatitle: 'Dashboard', 
        keyword: 'Dashboard', 
        description: 'Dashboard', 
        title: 'Dashboard',
        pageUrl: req.path
    });
});

router.get('/profile', authenticateMiddleware.notAllowAnonymous('administrator'), function (req, res) {
    res.render('account/profile', { 
        metatitle: 'Dashboard', 
        keyword: 'Dashboard', 
        description: 'Dashboard', 
        title: 'Dashboard',
        pageUrl: req.path
    });
});

module.exports = router;