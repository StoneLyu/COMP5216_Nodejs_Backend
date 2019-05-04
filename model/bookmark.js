//import {operationSuccess} from "./model";
require('../common');
require('./model');

const col_news = require('./news');
const col_user = require('./user');
const APIError = require('../rest').APIError;

const module_type = 'bookmark';


let ObjectId = mongoose.Schema.Types.ObjectId;
let ObjectID = mongoose.Types.ObjectId;

let bookmarkSchema = new mongoose.Schema({
    _id:{type:ObjectId, _id:true},
    userId : {type:ObjectId},
    newsId : {type:ObjectId},
    date:{type:Date}
},{collection :module_type});



const col_bookmark = db.model(module_type, bookmarkSchema, module_type);

class BookmarkController {

    async find(cond) {
        return await col_bookmark.find(cond);
    }

    async findOne(cond) {
        return await col_bookmark.findOne(cond);
    }

    async aggregate(cond) {
        return await col_bookmark.aggregate(cond);
    }

    // 获得单个书签
    async get(ctx) {

        //let id = new ObjectID(ctx.params.id);
        let id = ctx.params.id.trim();
        try {
            if (!checkId(id)) {
                error(module_type, 'bad id', 'bad id');
            }
            let bookmark = await col_bookmark.findById(id);
            if (!bookmark) {
                error(module_type, 'news:new_not_found', 'new not found');
            } else {
                success(ctx, bookmark);
            }
        } catch (e) {
            throw new APIError("news:new_not_found", e.message);
        }
    }


    // 放置单个书签
    async put(ctx) {
        let userId = ctx.request.body.userId.trim();
        let newsId = ctx.request.body.newsId.trim();

        // log(userId)
        // log(newsId)
        let uid = ctx.session.userId;
        try {
            if (!checkId(userId) || !checkId(newsId)) {
                error(module_type, 'bad id', 'bad id');
            }
            // check if a user exists
            //let users = await col_user.aggregate([{$match : {"_id":ObjectID(userId)}}]);
            let users = await col_user.find({_id:userId});
            if (!users.length) {
                error(module_type, 'user_not_found', 'user not found');
            }
            //let news = await col_news.aggregate([{$match : {"_id":ObjectID(newsId)}}]);
            let news = await col_news.find({_id:newsId});
            if (!news.length) {
                error(module_type, 'news_not_found', 'news not found');
            }

            let bookmark = await col_bookmark.find({userId : userId, newsId : newsId});
            if (bookmark.length) {
                // error(module_type, "bookmark already exists", "bookmark already exists");
                success(ctx, {bookMarkResult: 0});
                return;
            }
            // 插入书签
            //await col_bookmark.create({userId : userId, newsId: newsId, date: new Date()});
            let to_save = new col_bookmark({
                _id:new ObjectID(),
               userId:userId,
               newsId:newsId,
               date:new Date()
            });
            await to_save.save();

            // operation success
            success(ctx, {bookMarkResult: 2});
        }catch (e) {
            throw new APIError("bookmark:insert_failed", e.message)
        }
    }

    async delete(ctx) {
        let userId = ctx.request.body.userId;
        let newsId = ctx.request.body.newsId;
        // delete bookmark
        try {
            if (!checkId(userId) || !checkId(newsId)) {
                error(module_type, 'bad id', 'bad id');
            }
            // check if a user exists
            let users = await col_user.aggregate([{$match : {"_id":ObjectID(userId)}}]);
            if (!users.length) {
                error(module_type, 'bookmark:user_not_found', 'user not found');
            }
            let news = await col_news.aggregate([{$match : {"_id":ObjectID(newsId)}}]);
            if (!news.length) {
                error(module_type, 'bookmark:news_not_found', 'news not found');
            }
            let bookmark = await col_bookmark.find({userId : ObjectID(userId), newsId : ObjectID(newsId)});
            if (bookmark.length) {
                await col_bookmark.remove({_id : bookmark[0]._id});
                log("delete bookmark success");
                success(ctx, {bookMarkResult: -1});
            } else {
                log("delete bookmark failed");
                success(ctx, {bookMarkResult: 0});
            }

            //这里有问题
        }catch (e) {
            throw new APIError("bookmark:delete_failed", e.message);
        }
    }


    async getListByUser(ctx) {
        let id = ctx.params.id.trim();
        //if (null == )
        //console.log("bookmark list:" + id);

        try {
            if (!checkId(id)) {
                error(module_type, 'bad id', 'bad id');
            }
            let bookmarks = await col_bookmark.aggregate(
                [
                    {$match:{'userId':ObjectID(id)}},
                    {
                        $lookup:
                            {
                                from: "news",
                                localField: "newsId",
                                foreignField: "_id",
                                as: "to_news"
                            }
                    },
                    {$project:{'_id':1, 'date':1, 'to_news.title':1, 'to_news.pageView':1, 'to_news.vote':1,
                                'to_news.description':1, 'to_news.pictures':1, 'to_news._id':1}}
                ]);
            if (!bookmarks.length) {
                error(module_type, 'bookmark:user_not_found', 'user not found');
            } else {
                let result = [];
                bookmarks.forEach(function (v) {
                    if (v.to_news[0].pictures.length) {
                        v.to_news[0].pictures = [v.to_news[0].pictures[0]];
                    }
                    result.push({_id : v._id,
                        newsId : v.to_news[0]._id,
                        date : v.date,
                        title : v.to_news[0].title,
                        pageView : v.to_news[0].pageView,
                        vote : v.to_news[0].vote,
                        description : v.to_news[0].description,
                        pictures : v.to_news[0].pictures

                    });
                });
                success(ctx, result);
            }
        } catch (e) {
            throw new APIError("bookmark:user_not_found", e.message);
        }

    }

}

module.exports = new BookmarkController();

