const Koa = require('koa');
const router = require('./controller/router');
const session = require('koa-session');
const MongooseStore = require('koa-session-mongoose');
const bodyParser = require('koa-bodyparser');
const restify = require('./rest').restify;
require('./common');
const koa_views = require('koa-views');
const koa_static = require('koa-static');
const path = require('path');

const app = new Koa();


const sessionConf = {
    key: 'koa:session',
    maxAge: 86400000,
    overwrite: true,
    httpOnly: true,
    signed: true,
    rolling: false,
    renew: false,
    store: new MongooseStore({
        collection: 'session', //数据库集合
        connection: mongoose,     // 数据库链接实例
        //url: 'mongodb://mouseisbest.kmdns.net/new_svr',
        expires: 86400, // 默认时间为1天
        name: 'session' // 保存session的表名称
    })
};


app.keys = ['comp5216-group16'];
// response
app.use(bodyParser())
    .use(koa_static(path.join(__dirname, 'public')))
    .use(koa_views(path.join(__dirname, 'public'), {extension: 'ejs'}))
    .use(session(sessionConf, app))
    .use(restify())
    .use(router.routes())
    .use(router.allowedMethods());

app.listen(3000, '0.0.0.0' , ()=>{
    log("The server started listening port 3000.");
});