import Sequelize from "sequelize";

export default (sequelize, Sequelize) => {
  const foodStock = sequelize.define(
    "food_stock",
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      event_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "event",
          key: "event_id",
        },
      },
      pradesh_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "pradesh",
          key: "pradesh_id",
        },
      },
      food_item_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "food_items",
          key: "food_item_id",
        },
      },
      food_qty: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        comment: "Food quantity with +/- indicator",
      },
      person_mobile: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      person_name: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM("active", "inactive", "deleted"),
        allowNull: false,
        defaultValue: "active",
      },
      type: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "DR",
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
      tableName: "food_stock",
      timestamps: false, // We're using custom cdt/udt fields
    }
  );

  // Define associations
  foodStock.associate = (models) => {
    foodStock.belongsTo(models.pradesh, {
      foreignKey: "pradesh_id",
      as: "pradesh",
    });
    foodStock.belongsTo(models.event, {
      foreignKey: "event_id",
      as: "event",
    });
    foodStock.belongsTo(models.foodItems, {
      foreignKey: "food_item_id",
      as: "foodItem",
    });
  };

  return foodStock;
};
