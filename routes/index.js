'use strict';
var express = require('express');
var router = express.Router();
const sql = require('mssql');

var passport = require('passport'); //authentication module
var Strategy = require('passport-local').Strategy; //authentication module
var ensureLogin = require('connect-ensure-login'); //authentication module

const dbConfig = require('../models/dbConfig');
const page = require('../models/page');
const contactus = require('../models/contactus');
const login = require('../models/login');

const { check, validationResult } = require('express-validator/check');


/* GET home page. */
router.get('/', function (req, res) {
    res.render('home/index', { 
        metatitle: 'Home Page Title', 
        keyword: 'Home Page Keyword', 
        description: 'Home Page Description', 
        title: 'Node Js Application',
        pageUrl: req.path
    });
});

/* Contact Us page. */
router.get('/contact.html', function (req, res) {    
    res.render('home/contact', { 
        metatitle: 'Contact Us | Node JS', 
        keyword: 'Contact Us | Node JS', 
        description: 'Contact Us | Node JS', 
        title: 'Contact Us Form',
        pageUrl: req.path,
        csrfToken: req.csrfToken(),
        data: {
            Name: '',
            Email: '',
            Phone: '',
            Message: ''
        },
        errors: {}
    });
});

//Contact Us Post method
router.post('/contact.html',[
    //check('Name').isLength({min: 1, max: 10}).withMessage('Please enter name'), //Correct with multiple min, max, etc
    //check('Name').isLength({min: 1}).withMessage('Please enter name').isLength({max: 10}).withMessage('Only 10 chars allowed in name field').trim(),
    check('Name').isLength({min: 1}).withMessage('Please enter name').trim(),
    check('Email').isLength({min: 1}).withMessage('Email is required').isEmail().withMessage('Invalid Email Address').trim(),
    check('Phone').isLength({min: 1}).withMessage('Please enter phone number').trim()
], function (req, res) {
    
    const errors = validationResult(req);
    var Name = req.body.Name == undefined ? '' : req.body.Name;
    var Email = req.body.Email == undefined ? '' : req.body.Email;
    var Phone = req.body.Phone == undefined ? '' : req.body.Phone;
    var Message = req.body.Message == undefined ? '' : req.body.Message;

    if (!errors.isEmpty()) {
        res.render('home/contact', { 
            metatitle: 'Contact Us | Node JS', 
            keyword: 'Contact Us | Node JS', 
            description: 'Contact Us | Node JS', 
            title: 'Contact Us Form',
            pageUrl: req.path,
            csrfToken: req.csrfToken(),
            data: {
                Name: Name,
                Email: Email,
                Phone: Phone,
                Message: Message
            },
            errors:errors.mapped()
        });
    }else{

        //Save value in DB. Then redirect on thank you page
        contactus.save({
            Name: Name,
            Email: Email,
            Phone: Phone,
            Message: Message,
            IPAddress: req.connection.remoteAddress //req.ip 
        }, function(data){
            //Redirect functions          
            //req.flash('success', 'Thanks for contacting us');
            res.redirect('/contact-thanks.html?id=' + data);
        });        
    }

    

});


/* Login page. */
router.get('/login.html', function (req, res) {    
    res.render('account/login', { 
        metatitle: 'Login | Node JS', 
        keyword: 'Login | Node JS', 
        description: 'Login | Node JS', 
        title: 'Login Form',
        pageUrl: req.path,
        csrfToken: req.csrfToken(),
        data: {
            Username: '',
            Password: ''
        },
        errors: {}
    });
});

//Login using completly passport method

// router.post('/login.html', passport.authenticate('local', {
//     successRedirect: global.currentRoleName == 'student' ? '/account/index' : '/account/profile',
//     failureRedirect: '/login.html'
// })); 

router.post('/login.html',[
    check('Username').isLength({min: 1}).withMessage('Username is required').trim(),
    check('Password').isLength({min: 1}).withMessage('Password is required').trim()
],function (req, res) {
    const errors = validationResult(req);
    var Username = req.body.Username == undefined ? '' : req.body.Username;
    var Password = req.body.Password == undefined ? '' : req.body.Password;

    if(!errors.isEmpty()){
        res.render('account/login', { 
            metatitle: 'Login | Node JS', 
            keyword: 'Login | Node JS', 
            description: 'Login | Node JS', 
            title: 'Login Form',
            pageUrl: req.path,
            csrfToken: req.csrfToken(),
            data: {
                Username: Username,
                Password: Password
            },
            errors: errors.mapped()
        });
    }else{
        //Database check with username and password        
        login.validateUser({
            Username: Username,
            Password: Password
        }, function(data){
            var userid = '';
            var rolename = '';
            var recordset = data;
            if(recordset && recordset.length > 0){
                userid = recordset[0].UserId;
                rolename = recordset[0].LoweredRoleName;  
                
                req.login({
                    userid: userid,
                    username: Username,
                    rolename: rolename
                }, function(err){                    
                    
                    if(err){
                        return next(err);                        
                    }else{

                        res.locals.currentUserName = Username;
                        res.locals.currentUserId = userid;
                        res.locals.currentRoleName = rolename;
        
                        //add logic here to redirect on role base
                        var redirectURL = '/';
                        if(rolename == 'administrator'){
                            redirectURL = '/account/profile';
                        }else if(rolename == 'student'){
                            redirectURL = '/account/index';
                        }

                        req.session.save(function(){
                            res.redirect(redirectURL);
                        });                        

                    }

                });

            }else{
                res.render('account/login', { 
                    metatitle: 'Login | Node JS', 
                    keyword: 'Login | Node JS', 
                    description: 'Login | Node JS', 
                    title: 'Login Form',
                    pageUrl: req.path,
                    csrfToken: req.csrfToken(),
                    data: {
                        Username: Username,
                        Password: Password
                    },
                    errors: {
                        error:{
                            msg: 'Invalid username or password'
                        }
                    }
                });
            }
            
        });
    }    
});

router.get('/logout.html', function(req, res){
    req.logout();
    req.session.destroy();    
    res.redirect('/');
});

/* Dynamic Page. */
router.get('/:pageurl?', function (req, res) {

    page.getPageContentByURLProcedureMethod(req.params.pageurl, function(data){
        
        var recordset = data;
        var pageVariables = {
            metaTitle: '',
            metaKeywords: '',
            metaDescription: '',
            pageHeading: '',
            pageContent: '<p>Not Found</p>',
            status: 404
        }

        if(recordset && recordset.length > 0){
            pageVariables.metaTitle = recordset[0].MetaTitle;
            pageVariables.metaKeywords = recordset[0].MetaKeyword;
            pageVariables.metaDescription = recordset[0].MetaDescription;
            pageVariables.pageHeading = recordset[0].PageHeading;
            pageVariables.pageContent = recordset[0].PageContent;         
            pageVariables.status = 200;

            res.status(pageVariables.status).render('home/dynamicpage', {
                metatitle: pageVariables.metaTitle,
                keyword: pageVariables.metaKeywords,
                description: pageVariables.metaDescription,
                pageTitle: pageVariables.pageHeading,
                pageContent: pageVariables.pageContent,
                pageUrl: '/' + req.params.pageurl
            });

        }else{
            page.getPageContentByURLProcedureMethod('page-not-found.html', function(innerdata){
                recordset = innerdata;
                if(recordset && recordset.length > 0){
                    pageVariables.metaTitle = recordset[0].MetaTitle;
                    pageVariables.metaKeywords = recordset[0].MetaKeyword;
                    pageVariables.metaDescription = recordset[0].MetaDescription;
                    pageVariables.pageHeading = recordset[0].PageHeading;
                    pageVariables.pageContent = recordset[0].PageContent;         
                    pageVariables.status = 404;
                }

                res.status(pageVariables.status).render('home/dynamicpage', {
                    metatitle: pageVariables.metaTitle,
                    keyword: pageVariables.metaKeywords,
                    description: pageVariables.metaDescription,
                    pageTitle: pageVariables.pageHeading,
                    pageContent: pageVariables.pageContent,
                    pageUrl: '/' + req.params.pageurl
                });
            });
        }        
    
    });    
        
});

module.exports = router;
