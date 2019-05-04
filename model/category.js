require('../common');
require('./model');

const col_news = require('./news');
const APIError = require('../rest').APIError;

const module_type = 'category';

let ObjectId = mongoose.Schema.Types.ObjectId;
let ObjectID = mongoose.Types.ObjectId;
const cateSchema = new mongoose.Schema({
    name : String,
    parent : ObjectId
}, {collection:module_type});



const col_category = db.model(module_type, cateSchema, module_type);

class CategoryController {

    async find(cond) {
        return await col_category.find(cond);
    }

    async findOne(cond) {
        return await col_category.findOne(cond);
    }




    async get(ctx) {

        let categoryId = ctx.params.id.trim();
        if (!checkId(id)) {
            error(module_type, 'bad id', 'bad id');
        }

        //console.log("param.id=" + categoryId);
        // check if the category exists
        let categoryItem = await col_category.find({_id : categoryId});

        if (categoryItem.length === 0) { // no such category
            error(module_type, 'category:category_not_found', 'category not found');
        }
        success(ctx, categoryItem[0]);

    }

    async getAllCategory(ctx) {
        let data = await col_category.find();
        success(ctx, data);
    }

    async getListByCategory(ctx) {
        let categoryId = ctx.params.id.trim();
        if (!checkId(categoryId)) {
            error(module_type, 'bad id', 'bad id');
        }

        let latitude = parseFloat(ctx.params.lat);
        let longitude = parseFloat(ctx.params.lng);

        // check if the category exists
        let categoryItem = await col_category.find({_id : categoryId});

        if (!categoryItem.length) { // no such category
            error(module_type, 'category:category_not_found', 'category not found');
        }

        let news;
        try {
            let cond = [
                {$match:{'category':new ObjectID(categoryId)}},
                {$project:{'_id':1, 'title':1, 'pictures':1,'pageView':1, 'description':1, 'time':1, 'vote':1}},
                {$limit:100}
            ];
            if (!isNaN(latitude) && !isNaN(longitude)) { // get by location
                cond = [

                    {$geoNear : {
                            near: [longitude, latitude],
                            distanceField: "distance",
                            includeLocs: "location",
                            query : {'category': new ObjectID(categoryId)},
                            maxDistance : 5000, spherical : true}},
                    {$project:{'_id':1, 'title':1, 'pictures':1,'pageView':1, 'description':1, 'time':1, 'vote':1, 'distance' : 1}},
                    {$sort:{'distance' : 1}},
                    {$limit:100}
                ]
            }
            news = await col_news.aggregate(cond);
            news.forEach(function(value){
                if (value.pictures.length > 1) {
                    value.pictures = [value.pictures[0]];
                }
            });
            if (null == news) {
                error(module_type, 'category:category_not_found', 'not found');
            } else {
                success(ctx, news);
            }
        } catch (e) {
            throw new APIError("category:category_not_found", e.message);
        }


        success(ctx, news);
        log(`param.id=${categoryId}, latitude=${latitude}, longitude=${longitude}`);
    }
}

module.exports = new CategoryController();