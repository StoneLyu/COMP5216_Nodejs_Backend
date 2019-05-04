const Router = require('koa-router');
const restRouter = require('./api');
const APIError = require('../rest').APIError;
const newsModel = require('../model/newsPage');

const router = new Router();

router.get('/', async ctx => {
    ctx.body = 'Main page'
});

router.get('/upload', async ctx => {
    // console.log(ctx.request);
    let html = `
        <h1>koa2 upload demo</h1>
        <form method="POST" action="/api/newsPic" enctype="multipart/form-data">
            <p>file upload</p>
            <input name="file" type="file" size="9" multiple/><br/><br/>
            <button type="submit">submit</button>
        </form>
    `;
    ctx.body = html;
});

router.get('/login', async ctx => {
    // console.log(ctx.request);
    let html = `
        <h1>koa2 upload demo</h1>
        <form method="POST" action="/api/user/login/">
            <p>login</p>
            <span>title:</span><input name="username" type="text" /><br/>
            <span>userid:</span><input name="password" type="text" /><br/>
            <button type="submit">submit</button>
        </form>
    `;
    ctx.body = html;
});

router.get('/login', async ctx => {
    // console.log(ctx.request);
    let html = `
        <h1>koa2 upload demo</h1>
        <form method="POST" action="/api/newsAdd/">
            <p>login</p>
            <span>title:</span><input name="username" type="text" /><br/>
            <span>userid:</span><input name="password" type="text" /><br/>
            <button type="submit">submit</button>
        </form>
    `;
    ctx.body = html;
});


router.get('/news/:id/:distance/:userId', newsModel.renderNewsPage);

// check login credentials
// router.use(async ( ctx, next ) => {
//     //log(JSON.stringify(ctx.session));
//     //log(JSON.stringify(ctx.session.userId));
//     if (ctx.session && ctx.session.userId) {
//         log(`Member:${ctx.session.userId}`);
//         await next();
//         return;
//     } else {
//         if (ctx.path === '/api/user/login' ||
//             ctx.path === '/api/user/register' ||
//             ctx.path.indexOf('/api/news/') !== -1 ||
//             ctx.path.indexOf('/api/category') !== -1) {
//             log(`Guest access`, 1);
//             await next();
//             return;
//         }
//     }
//     error("auth", "you have not login!");
// });

router.use(restRouter.routes());
router.use(restRouter.allowedMethods());

module.exports = router;