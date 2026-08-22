import Sequelize from "sequelize";

export default (sequelize, Sequelize) => {
  const defaultStock = sequelize.define(
    "default_stock",
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
      type: {
        type: Sequelize.ENUM("cr", "dr"),
        allowNull: false,
        comment: "Transaction type: cr for credit, dr for debit",
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
      type: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "DR",
      },
    },
    {
      tableName: "default_stock", // This should match your actual database table name
      timestamps: false, // We're using custom cdt/udt fields
      indexes: [
        {
          fields: ["event_id"],
        },
        {
          fields: ["pradesh_id"],
        },
        {
          fields: ["food_item_id"],
        },
      ],
    }
  );

  // Define associations
  defaultStock.associate = (models) => {
    defaultStock.belongsTo(models.pradesh, {
      foreignKey: "pradesh_id",
      as: "pradesh",
    });
    defaultStock.belongsTo(models.event, {
      foreignKey: "event_id",
      as: "event",
    });
    defaultStock.belongsTo(models.foodItems, {
      foreignKey: "food_item_id",
      as: "foodItem",
    });
  };

  return defaultStock;
};
