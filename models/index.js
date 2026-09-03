import { Sequelize } from "sequelize";
import dbConfig from "../config/database.js";
import initUserModel from "./user.js";
import initPradeshModel from "./pradesh.js";
import initEventModel from "./event.js";
import initFoodItemsModel from "./foodItems.js";
import initFoodStockModel from "./foodStock.js";
import initDefaultStockModel from "./defaultStock.js";
import initPrasadStockModel from "./prasadStock.js";
import initNotificationHistoryModel from "./notificationHistory.js";

// Create a Sequelize instance
const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  dialect: dbConfig.dialect,
  dialectOptions: dbConfig.ssl
    ? {
        ssl: {
          require: true,
          rejectUnauthorized: false,
        },
        // Pooled connections are now held for minutes; keep-alive stops
        // idle TCP being dropped silently in between.
        keepAlive: true,
      }
    : { keepAlive: true },
  pool: {
    max: dbConfig.pool.max,
    min: dbConfig.pool.min,
    acquire: dbConfig.pool.acquire,
    idle: dbConfig.pool.idle,
  },
});

// Initialize the database object to store models
const db = {
  Sequelize,
  sequelize,
  user: initUserModel(sequelize, Sequelize), // Initialize user model
  pradesh: initPradeshModel(sequelize, Sequelize), // Initialize pradesh model
  event: initEventModel(sequelize, Sequelize), // Initialize event model
  foodItems: initFoodItemsModel(sequelize, Sequelize), // Initialize food items model
  foodStock: initFoodStockModel(sequelize, Sequelize), // Initialize food stock model
  defaultStock: initDefaultStockModel(sequelize, Sequelize), // Initialize default stock model
  prasadStock: initPrasadStockModel(sequelize, Sequelize), // Initialize prasad stock model
  notificationHistory: initNotificationHistoryModel(sequelize, Sequelize)
};

// Apply associations if defined in models
Object.values(db).forEach((model) => {
  if (model.associate) {
    model.associate(db);
  }
});

// Export the database object
export default db;
