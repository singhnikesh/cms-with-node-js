'use strict';
var authenticateMiddleware = {
    notAllowAnonymous: function(rolename){
        return(req, res, next) =>{    
            //var currentRoleName = (req.session.passport == undefined || req.session.passport == null) ? '' : req.session.passport.user.rolename;
            //console.log('Before: ' + currentRoleName);
            if(req.isAuthenticated()){
                //console.log('req.session.passport.user: ' + JSON.stringify(req.session.passport));
                if(res.locals.currentRoleName.toLowerCase() == rolename.toLowerCase()){
                    return next(); 
                }else{
                    res.redirect('/login.html');    
                }
            }else{
                res.redirect('/login.html');
            }            
        }
    }
}
module.exports = authenticateMiddleware;