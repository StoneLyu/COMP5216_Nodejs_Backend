require('../common');
require('./model');

const col_news = require('./news');
const col_user = require('./user');
const APIError = require('../rest').APIError;

const module_type = 'comment';


let ObjectId = mongoose.Schema.Types.ObjectId;
let ObjectID = mongoose.Types.ObjectId;

let commentSchema = new mongoose.Schema({
    //_id:{type:ObjectId},
    content : {type:String},
    userId : {type:ObjectId},
    newsId : {type:ObjectId},
    replyToId : {type:ObjectId},
    date:{type:Date}
},{collection :module_type});

const col_comment = db.model(module_type, commentSchema, module_type);

class CommentController {
    async get(ctx) {

        let userName = ctx.params.name;
        let users = await col_comment.find({userName : userName});
        ctx.rest(users[0]);
        if (users.length == 0) {
            throw new APIError('news:new_not_found', 'new not found');
        }

    }

    async put(ctx) {
        let newsId = ctx.request.body.newsId,
            //userId = ctx.session.userId,
            userId = ctx.request.body.userId,
            // replyToId = ctx.request.body.replyToId,
            content = ctx.request.body.content;
        let isReplyTo = false;
        if (checkId(newsId) && checkId(userId)) {
            // if (!isNaN(replyToId)) {
            //     if (!checkId(replyToId)) {
            //         error(module_type, "bad parameter");
            //     }
            //     //check if reply to user exists
            //     let user = await col_user.aggregate([{$match : {"_id":ObjectID(replyToId)}}]);
            //     if (!user.length) {
            //         error(module_type, "bad parameter");
            //     } else {
            //         isReplyTo = true;
            //     }
            // }
            // check if id in the database
            let news = await col_news.aggregate([{$match : {"_id":ObjectID(newsId)}}]);
            if (!news.length) {
                error(module_type, "bad parameter");
            }
            let users = await col_user.aggregate([{$match : {"_id":ObjectID(userId)}}]);
            if (!users.length) {
                error(module_type, "bad parameter");
            }
            try {
                // if (isReplyTo) {
                if (false) {
                    await col_comment.create({userId:userId, newsId:newsId,
                        replyToId:replyToId, content:content, date:new Date()});
                } else {
                    await col_comment.create({userId:userId, newsId:newsId,
                        content:content, date:new Date()});
                    await success(ctx, {status: "success"});
                }
            } catch (e) {
                error(module_type, "db error");
            }
            success(ctx);

        } else {
            error(module_type, "bad id");
        }
    }

    async getByNewsId(ctx) {
        let newsId = ctx.params.id;

        // check if id is valid
        if (checkId(newsId)) {
            let data;
            try {
                data = await col_comment.aggregate(
                    [
                        {$match:{'newsId':ObjectID(newsId)}},
                        {
                            $lookup:
                                {
                                    from: "user",
                                    localField: "userId",
                                    foreignField: "_id",
                                    as: "to_user"
                                }
                        },
                        {
                            $lookup:
                                {
                                    from: "user",
                                    localField: "replyToId",
                                    foreignField: "_id",
                                    as: "to_userReply"
                                }
                        },
                        {$project:{'_id':1, 'content' : 1, 'to_user.userName' : 1, 'to_userReply.userName':1, 'date':1}}
                    ]);
            } catch (e) {
                error(module_type, "db error");
            }
            success(ctx, data);

        } else {
            error(module_type, "bad news id");
        }

    }
}

module.exports = new CommentController();

