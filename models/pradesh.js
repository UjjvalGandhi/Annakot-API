import Sequelize from 'sequelize';

export default (sequelize, Sequelize) => {
    const pradesh = sequelize.define('pradesh', {
        pradesh_id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        pradesh_eng_name: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        pradesh_guj_name: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        pradesh_old_eng_name: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        pradesh_new_guj_name: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        user_ids: {
            type: Sequelize.TEXT,
            allowNull: true,
            comment: 'Comma-separated user IDs'
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
        tableName: 'pradesh',
        timestamps: false, // We're using custom cdt/udt fields
    });

    // Define associations
    pradesh.associate = (models) => {
        pradesh.hasMany(models.foodStock, {
            foreignKey: 'pradesh_id',
            as: 'foodStocks'
        });
        pradesh.hasMany(models.prasadStock, {
            foreignKey: 'pradesh_id',
            as: 'prasadStocks'
        });
    };

    return pradesh;
};
