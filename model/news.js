const APIError = require('../rest').APIError;
require('../common');
require('./model');

let ObjectId = mongoose.Schema.Types.ObjectId;
let ObjectID = mongoose.Types.ObjectId;

const inspect = require('util').inspect;
const fs = require('fs');
const Busboy = require('busboy');
const path = require('path');
const Int32 = require('mongoose-int32');

const col_user = require('./user');

const module_type = "news";

const newsSchema = new mongoose.Schema({
    _id: {type: ObjectId, required:true},
    title: {type: String, required:true},
    userId: {type: ObjectId, required:true},
    time: {type: Date, required:true},
    location: {type: { type: String, default: 'Point' }, coordinates: [Number]},
    description: {type:String, required:true},
    content:{type:String, required:true},
    pictures: [],
    category:{type:ObjectId, required:true},
    pageView:{type:Int32, required:true},
    vote:{type:Int32, required:true}
},{collection :module_type});

let col_news = db.model(module_type, newsSchema, module_type);



class NewsController {

    async find(cond) {
        return await col_news.find(cond);
    }

    async findOne(cond) {
        return await col_news.findOne(cond);
    }

    async aggregate(cond) {
        return await col_news.aggregate(cond);
    }

    async update(cond, doc, options) {
        return await col_news.update(cond, doc, options);
    }

    async findById(cond) {
        return await col_news.findById(cond);
    }


    // get news
    async get(ctx) {

        let id = ctx.params.id.trim();

        try {
            if (!checkId(id)) {
                error(module_type, 'bad id', 'bad id');
            }
            //let news = await col_news.findOne({_id:id});
            let news = await col_news.aggregate(
                    [{$match:{'_id':ObjectID(id)}},
                    {
                        $lookup:
                            {
                                from: "user",
                                localField: "userId",
                                foreignField: "_id",
                                as: "userInfo"
                            }
                    },
                    {$project:{'_id':0, 'title':1, 'userInfo.userName':1, 'time':1, 'location':1,
                        'content':1, 'pictures':1, 'pageView':1, 'vote':1}}
                ]);
            if (null == news) {
                error(module_type, 'news:new_not_found', 'new not found');
            } else {
                success(ctx, news);
            }
        } catch (e) {
            throw new APIError("news:new_not_found", e.message);
        }
    }

    async put(ctx) {
        let userId = ctx.session.userId;
        let user = await col_user.find({_id : userId});
        if (!user.length) {
            error(module_type, "no such user");
        }
        let body = ctx.request.body;
        let pictures = [];
        if (body.picture && body.picture.length > 1) {
            pictures.push(body.picture);
        }
        try {
            let back = await col_news.create({
                _id:new ObjectID(),
                userId:userId,
                time:new Date(),
                location:{type:"Point", coordinates:[body.lng, body.lat]},
                title:body.title,
                content:body.content,
                pictures:pictures,
                description:body.content,
                category:body.categoryId,
                pageView:1,
                vote:0
            });
            if (!back) {
                error(module_type, "insert failed");
            } else {
                success(ctx, back);
            }
        } catch (e) {
            log(module_type, e.message);
            error(module_type, "insert failed");
        }
    }



    async setNewsVote(ctx) {
        let newsId = ctx.request.body.newsId;
        let voteFlag = ctx.request.body.vote; //vote 的值为 "1" or "-1"
        log(voteFlag);
        try {
            if (!checkId(newsId)) {
                error(module_type, 'bad id', 'bad id');
            }

            let insertVote = await col_news.update(
                {"_id":newsId},
                {$inc:
                        {vote: voteFlag}
                });


            log(JSON.stringify(insertVote));

            if (null == insertVote) {
                error(module_type, 'vote: vote failed', 'vote failed');
            } else {
                success(ctx, insertVote);
            }
        } catch (e) {
            throw new APIError("vote: vote error", e.message);
        }
    }




    async uploadFile(ctx) {
        function getSuffixName(fileName) {
            let nameList = fileName.split('.');
            return nameList[nameList.length - 1];
        }

        let req = ctx.request;
        let busboy = new Busboy({headers: req.headers});

        //注意，这里的文件路径是/public/img
        let localFilePath = path.join(__dirname, '../public/img/');
        // let localFilePath = path.join(upperPath, inspect(req.body.userId));
        // let filePath = path.join(localFilePath, );

        // let mkdirResult = mkdirSync(localFilePath);

        return new Promise((resolve, reject) => {
            console.log('uploading');
            let result = {
                success: false,
                formData: {}
            };

            //传来的是文件
            busboy.on('file', function (fieldname, file, filename, encoding, mimetype) {
                // let currentTime = Date.now();
                // let fileName = currentTime + '.' + getSuffixName(filename);
                let uploadFilePath = path.join(localFilePath, filename);
                let saveTo = path.join(uploadFilePath);

                file.pipe(fs.createWriteStream(saveTo));

                file.on('end', function () {
                    //DB operations
                    //send fileName and path to the DB
                    // to be done


                    // return status
                    result.success = true;
                    result.message = "upload successfully";
                    resolve(result);
                    console.log("upload file successfully");
                });
            });

            busboy.on ('field', function (fieldname, val, fieldnameTruncated, valTruncated, encoding, mimetype) {
                // DB operations
                // send field name and value to the DB
                //to be done

                //return status
                result.formData = {1: 1, 2: 2};
            });

            busboy.on('finish', function () {
                log('upload ended');
                resolve(result);
            });

            busboy.on('err', function (err) {
                log('upload file failed! ' + err);
                reject(result);
            });

            // console.log(busboy);
            ctx.req.pipe(busboy);
            // let data = {success: true}
            // ctx.rest(data);
        });
    }
}

module.exports = new NewsController();