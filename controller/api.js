const user = require('../model/user');
const news = require('../model/news');
const category = require('../model/category');
const bookmark = require('../model/bookmark');
//const uploadController = require('./uploadController');
const comment = require('../model/comment');


const Router = require('koa-router');
const router = new Router();

const restAPI = '/api/';




// user REST transaction
router.get(restAPI + 'user', user.get);//done
router.post(restAPI + 'user/login', user.login);
router.post(restAPI + 'user/register', user.register);
router.get(restAPI + 'user/:id/bookmarks', bookmark.getListByUser);//done
router.get(restAPI + 'user/:id/news', user.getListByUser);//done

// news REST transaction
router.get(restAPI + 'news/:id', news.get);//done
router.get(restAPI + 'news/:id/comment', comment.getByNewsId);
router.post(restAPI + 'news', news.setNewsVote);
router.post(restAPI + 'newsAdd', news.put);
// Stone's part
// file and news upload API
router.post(restAPI + 'newsPic', news.uploadFile);

// category REST
router.get(restAPI + 'category/:id', category.get);//获得类别信息 done
router.get(restAPI + 'category/', category.getAllCategory);//get all category details
router.get(restAPI + 'category/:id/list', category.getListByCategory);//获得该类别下所有新闻列表 done
router.get(restAPI + 'category/:id/list/:lat/:lng', category.getListByCategory);//获得该类别下所有新闻列表 done

// bookmark REST
router.get(restAPI + 'bookmark/:id', bookmark.get);//获得该书签信息
router.post(restAPI + 'bookmark', bookmark.put); //添加一个书签
router.delete(restAPI + 'bookmark', bookmark.delete);
//router.get(restAPI + 'bookmark/')





//comment REST
router.get(restAPI + 'comment/:id', comment.get);

//这里put怎么还在url里获取参数呢？？
router.post(restAPI + 'comment/', comment.put);



module.exports = router;
