//const db = require('./model');
//const col_user = db.get('user');
const APIError = require('../rest').APIError;
require('../common');
require('./model');
let ObjectId = mongoose.Schema.Types.ObjectId;
const module_type = "user";
const userSchema = new mongoose.Schema({
    _id: {type: ObjectId},
    userName: {type: String},
    email: {type: String},
    password: {type: String},
    favCategory: [],
},{collection :module_type});


let col_user = db.model(module_type, userSchema, module_type);
let ObjectID = mongoose.Types.ObjectId;



class UserController {


    async find(cond) {
        return await col_user.find(cond);
    }

    async findOne(cond) {
        return await col_user.findOne(cond);
    }

    async aggregate(cond) {
        return await col_user.aggregate(cond);
    }


    // get user detail
    async get(ctx) {
        let error_item = {_id: -1, userName:-1, password:-1};
        let userId = ctx.session.userId;
        if (null == userId) {
            success(ctx, error_item);
            return;
        }
        let users = await col_user.aggregate([
            {$match:{ "_id" : ObjectID(userId)}},
            {$project: {"_id":1, "userName":1, "email":1, "favCategory":1}}
        ]);
        if (!users.length) {
            //error(module_type, 'auth:user_not_found', 'user not found');
            success(ctx, error_item);
            return;
        }
        success(ctx, users[0]);
    }

    // 用户注册
    async register(ctx) {
        // await ……
        let name = ctx.request.body.username.trim() || '',
            pwd = ctx.request.body.password.trim() || '',
            email = ctx.request.body.email.trim() || '';
        let error_item = {_id: -1, userName:-1, password:-1};
        let users = await col_user.find({userName : name, email:email});
        if (users.length || !name.length || !pwd.length || !email.length) {
            success(ctx, error_item);
            log("register failed");
            return;
            //throw new APIError('auth:user_not_found', 'user not found');
        }
        let res = await col_user.create({_id: new ObjectID(), userName:name, email:email, password:pwd});
        //let res = col_user.findOne({userName:name, email:email});
        log("register success");
        success(ctx, res);

    }

    // 用户登录
    async login(ctx) {
        let name = ctx.request.body.username || '',
            pwd = ctx.request.body.password || '';
        let users = await col_user.find({userName : name});
        let error_item = {_id: -1, userName:-1, password:-1};
        if (!users.length) {
            success(ctx, error_item);
            return;
            //throw new APIError('auth:user_not_found', 'user not found');
        }

        let user = users[0];
        if (pwd !== user.password) {
            success(ctx, error_item);
            return;
            //throw new APIError('auth:user_not_found', 'user not found');
        }
        user.password = "";
        let session = ctx.session;
        //session.isLogin = true;
        session.userId = user._id;
        /*ctx.cookies.set('cid',
            session.id,
            {
                domain: 'localhost',  // 写cookie所在的域名
                path: '/',       // 写cookie所在的路径
                maxAge: 10 * 60 * 1000, // cookie有效时长
                //expires: new Date('2017-02-15'),  // cookie失效时间
                httpOnly: false,  // 是否只用于http请求中获取
                overwrite: false  // 是否允许重写
            });*/
        success(ctx, user);
        log(name + pwd + "login success");
    }

    // 用户退出
    async logout(ctx) {
        // await ……
    }

    // 更新用户资料
    async put(ctx) {
        // await ……


    }

    // 重置密码
    async resetpwd(ctx) {
        // await ……
    }

    async getListByUser(ctx) {
        let userId = ctx.params.id.trim();
        if (!checkId(userId)) {
            error(module_type, 'bad id', 'bad id');
        }

        // check if the user exists
        let userItem = await col_user.find({_id : userId});

        if (!userItem.length) { // no such category
            error(module_type, module_type, 'user not found');
        }

        let news;
        try {
            let cond = [

                {$match: {'_id': new ObjectID(userId)}},
                {
                    $lookup: {
                        from: "news",
                        localField: "_id",
                        foreignField: "userId",
                        as: "to_news"
                    }
                },
                {
                    $project: {
                        '_id': 0,
                        'to_news._id': 1,
                        'to_news.title': 1,
                        'to_news.pictures': 1,
                        'to_news.pageView': 1,
                        'to_news.description': 1,
                        'to_news.time': 1,
                        'to_news.vote': 1
                    }
                },
                {$sort: {'time': 1}},
                {$limit: 10}
            ];

            news = await col_user.aggregate(cond);
            let result;
            news[0].to_news.forEach(function(value){
                if (value.pictures.length > 1) {
                    value.pictures = [value.pictures[0]];
                }

            });
            result = news[0].to_news;
            if (null == news) {
                error(module_type, module_type, 'not found');
            } else {
                success(ctx, result);
            }
        } catch (e) {
            throw new APIError(module_type, e.message);
        }


        //success(ctx, news);
        log(`param.id=${userId}, get user post list success`);
    }



}
module.exports = new UserController();
