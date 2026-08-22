import Sequelize from "sequelize";

export default (sequelize, Sequelize) => {
  const event = sequelize.define(
    "event",
    {
      event_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      event_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      event_desc: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      event_location: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      event_max_prasad_date: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      event_date: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      event_item_last_date: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      is_prasad_active: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM("active", "inactive", "deleted"),
        allowNull: false,
        defaultValue: "active",
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
    },
    {
      tableName: "event",
      timestamps: false, // We're using custom cdt/udt fields
    }
  );

  // Define associations
  event.associate = (models) => {
    event.hasMany(models.foodStock, {
      foreignKey: "event_id",
      as: "foodStocks",
    });
    event.hasMany(models.prasadStock, {
      foreignKey: "event_id",
      as: "prasadStocks",
    });
  };

  return event;
};
