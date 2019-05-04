const APIError = require('../rest').APIError;
require('../common');
require('./model');

let ObjectId = mongoose.Schema.Types.ObjectId;
let ObjectID = mongoose.Types.ObjectId;

const module_type = "news";

const newsSchema = new mongoose.Schema({
    _id: {type: ObjectId},
    title: {type: String},
    userId: {type: ObjectId},
    time: {type: Date},
    location: {type : {type:String}, coordinates:[]},
    description: String,
    content:String,
    pictures: [],
    category:ObjectId,
    pageView:Number,
    vote:Number
},{collection :module_type});

let col_news = db.model(module_type, newsSchema, module_type);

class newsPage {
    async renderNewsPage(ctx) {
        let newsId = ctx.params.id.trim();
        let distance;
        let userId;

        userId = ctx.params.userId;

        if (ctx.params.distance === 'null') {
            distance = "null";
        } else {
            distance = ctx.params.distance;
        }


        log(newsId + "||" + distance);

        try {
            if (!checkId(newsId)) {
                error(module_type, 'bad id', 'bad id');
            }
            //let news = await col_news.findOne({_id:id});
            await col_news.findOneAndUpdate({_id:newsId},  {$inc: { pageView: 1 } } );
            let news = await col_news.aggregate(
                [{$match:{'_id':ObjectID(newsId)}},
                    {
                        $lookup:
                            {
                                from: "user",
                                localField: "userId",
                                foreignField: "_id",
                                as: "userInfo"
                            }
                    },
                    {$project:{'_id':1, 'title':1, 'userInfo.userName':1, 'time':1, 'location':1,
                            'content':1, 'pictures':1, 'pageView':1, 'vote':1}}
                ]);


            news[0].distance = distance;
            news[0].userId = userId;

            if (null == news) {
                error(module_type, 'news:new_not_found', 'new not found');
            } else {
                log(news[0].pictures)
                await ctx.render('newsPage', {news: news});
            }
        } catch (e) {
            throw new APIError("find news detail page failed", e.message);
        }
    }
}

module.exports = new newsPage();