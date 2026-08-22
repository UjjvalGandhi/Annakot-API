import Sequelize from 'sequelize';

export default (sequelize, Sequelize) => {
    const user = sequelize.define('users', {
        user_id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        user_name: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        user_mobile: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        user_password: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        user_type: {
            type: Sequelize.ENUM('admin', 'user', 'volunteer'),
            allowNull: false,
            defaultValue: 'user',
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
        tableName: 'users',
        timestamps: false, // We're using custom cdt/udt fields
    });

    // Define associations
    user.associate = (models) => {
        user.hasMany(models.prasadStock, {
            foreignKey: 'user_id',
            as: 'prasadStocks'
        });
    };

    return user;
};
