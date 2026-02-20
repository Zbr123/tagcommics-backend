const { sequelize } = require('../../config/pg-config');

// Load models and set associations before sync (creates junction tables)
require('../models/associations');


async function syncModels() {
    try{
        await sequelize.sync({
            alter:true,
            force: false
        });

        console.log("all models synchronized successfully");
    }catch(err){
        console.error(err)
    }
}

module.exports={
    syncModels
}