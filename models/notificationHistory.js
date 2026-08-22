import Sequelize from 'sequelize';

export default (sequelize, Sequelize) => {
    const notificationHistory = sequelize.define('notification_history', {
        id: {
            type: Sequelize.BIGINT,
            primaryKey: true,
            autoIncrement: true,
        },
        user_id: {
            type: Sequelize.BIGINT,
            allowNull: false,
        },
        title: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        message: {
            type: Sequelize.TEXT,
            allowNull: false,
        },
        created_at: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.NOW,
        },
        pradesh_id: {
            type: Sequelize.BIGINT,
            allowNull: false,
        }
    }, {
        tableName: 'notification_history',
        timestamps: false, // Using custom created_at
    });

    // No associations needed for this simple version
    notificationHistory.associate = () => {};

    return notificationHistory;
};