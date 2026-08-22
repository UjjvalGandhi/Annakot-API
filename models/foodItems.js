import Sequelize from 'sequelize';

export default (sequelize, Sequelize) => {
    const foodItems = sequelize.define('food_items', {
        food_item_id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        food_eng_name: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        food_guj_name: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        food_unit: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        food_image_url: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        food_category: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        food_remark: {
            type: Sequelize.TEXT,
            allowNull: true,
        },
        status: {
            type: Sequelize.ENUM('active', 'inactive', 'deleted'),
            allowNull: false,
            defaultValue: 'active',
        },
        cdt: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.NOW,
        },
        udt: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.NOW,
        },
    }, {
        tableName: 'food_items',
        timestamps: false, // We're using custom cdt/udt fields
    });

    // Define associations
    foodItems.associate = (models) => {
        foodItems.hasMany(models.foodStock, {
            foreignKey: 'food_item_id',
            as: 'foodStocks'
        });
    };

    return foodItems;
};
