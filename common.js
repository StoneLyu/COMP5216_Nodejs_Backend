const APIError = require('./rest').APIError;
require('colors');

global.success = function operationSuccess(ctx, data) {
    if (null != data) {
        //data['code'] = "success";
        ctx.rest(data);
    }
};

global.error =  function (type, msg) {
    throw Error(`${type}:${msg}`);
};



const logType = ['I', 'W', 'E'];
const outColor = ['white', 'yellow', 'red'];
global.log = function (msg, type) {
    let date1 = new Date();
    if (type === undefined) {
        type = 0;
    }
    console.log(`${logType[type]}|[${date1.getHours()}:${date1.getMinutes()}:${date1.getSeconds()}]|${msg}`[outColor[type]]);
};