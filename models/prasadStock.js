import Sequelize from "sequelize";

export default (sequelize, Sequelize) => {
  const prasadStock = sequelize.define(
    "prasad_stock",
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
      prasad_box_qty: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
        comment: "Prasad box quantity with +/- indicator",
      },
      deliver_box_qty: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
        comment: "Prasad deliver packet quantity with +/- indicator",
      },
      deliver_packet_qty: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
        comment: "Prasad deliver box quantity with +/- indicator",
      },
      prasad_packet_qty: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        comment: "Prasad packet quantity with +/- indicator",
      },
      person_mobile: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      person_name: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "users",
          key: "user_id",
        },
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
      tableName: "prasad_stock",
      timestamps: false, // We're using custom cdt/udt fields
    }
  );

  // Define associations
  prasadStock.associate = (models) => {
    prasadStock.belongsTo(models.pradesh, {
      foreignKey: "pradesh_id",
      as: "pradesh",
    });
    prasadStock.belongsTo(models.event, {
      foreignKey: "event_id",
      as: "event",
    });
    prasadStock.belongsTo(models.user, {
      foreignKey: "user_id",
      as: "user",
    });
  };

  return prasadStock;
};
