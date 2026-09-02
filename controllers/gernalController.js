import db from "../models/index.js";
import { successResponse, errorResponse } from "../utils/responseHandler.js";
import { Op } from 'sequelize';

export const insertData = async (req, res) => {
  try {
    const { table, ...fieldsToInsert } = req.body;

    if (!table) {
      return errorResponse(res, "Table name not provided.");
    }

    const dynamicModel = db[table];
    if (!dynamicModel) {
      return errorResponse(res, "Table not found.");
    }

    if (Object.keys(fieldsToInsert).length === 0) {
      return errorResponse(res, "No valid fields provided for insert.");
    }

    const newRecord = dynamicModel.build(fieldsToInsert);
    const savedRecord = await newRecord.save();

    successResponse(res, {
      msg: `${table} data inserted successfully.`,
      id: savedRecord.id,
    });
  } catch (error) {
    errorResponse(res, error.message);
  }
};

export const updateData = async (req, res) => {
  try {
    const { table, id, ...fieldsToUpdate } = req.body;

    if (!table || !id) {
      return errorResponse(res, "Table or ID not provided.");
    }

    const dynamicModel = db[table];
    if (!dynamicModel) {
      return errorResponse(res, "Table not found.");
    }

    const existingData = await dynamicModel.findByPk(id);
    if (!existingData) {
      return errorResponse(res, "Data not found.");
    }

    await existingData.update(fieldsToUpdate);
    const updatedData = await dynamicModel.findByPk(id);

    successResponse(res, updatedData);
  } catch (error) {
    errorResponse(res, error.message);
  }
};

export const getData = async (req, res) => {
  try {
    const { table, filters, orderBy, order, orFilters } = req.body;

    if (!table) {
      return errorResponse(res, "Table name not provided.");
    }

    const dynamicModel = db[table];
    if (!dynamicModel) {
      return errorResponse(res, "Table not found.");
    }

    // Build query options
    const queryOptions = {};

    // AND filters
    if (filters) {
      queryOptions.where = filters; 
    }

    // OR filters
    if (orFilters && Array.isArray(orFilters) && orFilters.length > 0) {
      queryOptions.where = {
        ...(queryOptions.where || {}),
        [Op.or]: orFilters
      };
    }

    // Order by
    if (orderBy) {
      queryOptions.order = [[orderBy, (order && order.toUpperCase() === 'DESC') ? 'DESC' : 'ASC']];
    }

    const records = await dynamicModel.findAll(queryOptions);

    successResponse(res, records);
  } catch (error) {
    errorResponse(res, error.message);
  }
};

export const deleteData = async (req, res) => {
  try {
    const { table, id } = req.body;

    if (!table || !id) {
      return errorResponse(res, "Table name or ID not provided.");
    }

    const dynamicModel = db[table];
    if (!dynamicModel) {
      return errorResponse(res, "Table not found.");
    }

    const record = await dynamicModel.findByPk(id);
    if (!record) {
      return errorResponse(res, "Record not found.");
    }

    await record.destroy();
    successResponse(res, {
      success: true,
      message: "Record deleted successfully.",
    });
  } catch (error) {
    console.error("Error deleting record:", error);
    errorResponse(res, error.message);
  }
};

// GET API for Food Items with Total Quantity
export const getItem = async (req, res) => {
  try {
    const { food_item_id, event_id } = req.body;

    if (food_item_id) {
      // Get specific food item with total quantity from entire foodStock table
      const foodItem = await db.foodItems.findByPk(food_item_id);
      if (!foodItem) {
        return errorResponse(res, "Food item not found.");
      }

      let stockWhereClause = { food_item_id: food_item_id };

      if (event_id) {
        stockWhereClause.event_id = event_id;
      }

      const stockData = await db.foodStock.findAll({
        where: stockWhereClause,
        attributes: ["food_qty"],
      });

      // Calculate total quantity from entire table
      const totalQty = stockData.reduce((sum, record) => {
        return sum + parseFloat(record.food_qty || 0);
      }, 0);

      const itemData = {
        food_item_id: foodItem.food_item_id,
        food_eng_name: foodItem.food_eng_name,
        food_guj_name: foodItem.food_guj_name,
        food_unit: foodItem.food_unit,
        food_image_url: foodItem.food_image_url,
        food_category: foodItem.food_category,
        food_remark: foodItem.food_remark,
        status: foodItem.status,
        cdt: foodItem.cdt,
        udt: foodItem.udt,
        total_qty: totalQty,
        stock_records_count: stockData.length,
      };

      successResponse(res, {
        msg: "Food item with total quantity retrieved successfully",
        data: [itemData],
      });
    } else {
      // Get all food items with their total quantities from entire foodStock table
      const foodItems = await db.foodItems.findAll({
        where: { status: "active" },
        order: [
          ["food_category", "ASC"],
          ["food_item_id", "ASC"],
        ],
      });

      const itemsWithTotalQty = await Promise.all(
        foodItems.map(async (item) => {
          let stockWhereClause = { food_item_id: item.food_item_id };

          if (event_id) {
            stockWhereClause.event_id = event_id;
          }

          const stockData = await db.foodStock.findAll({
            where: stockWhereClause,
            attributes: ["food_qty"],
          });

          const totalQty = stockData.reduce((sum, record) => {
            return sum + parseFloat(record.food_qty || 0);
          }, 0);

          return {
            food_item_id: item.food_item_id,
            food_eng_name: item.food_eng_name,
            food_guj_name: item.food_guj_name,
            food_unit: item.food_unit,
            food_image_url: item.food_image_url,
            food_category: item.food_category,
            food_remark: item.food_remark,
            status: item.status,
            cdt: item.cdt,
            udt: item.udt,
            total_qty: totalQty,
            stock_records_count: stockData.length,
          };
        })
      );

      successResponse(res, {
        msg: "All food items with total quantities retrieved successfully",
        data: itemsWithTotalQty,
      });
    }
  } catch (error) {
    console.error("Error fetching food items with quantities:", error);
    errorResponse(res, error.message);
  }
};

// GET API for Pradesh-wise Stock Totals by Food Item
export const getItemStock = async (req, res) => {
  try {
    const { food_item_id, event_id } = req.body;

    if (food_item_id) {
      // Get specific food item with pradesh-wise stock totals
      const foodItem = await db.foodItems.findByPk(food_item_id);
      if (!foodItem) {
        return errorResponse(res, "Food item not found.");
      }

      let stockWhereClause = { food_item_id: food_item_id };

      if (event_id) {
        stockWhereClause.event_id = event_id;
      }

      const stockData = await db.foodStock.findAll({
        where: stockWhereClause,
        attributes: ["pradesh_id", "food_qty"],
        include: [
          {
            model: db.pradesh,
            as: "pradesh",
            attributes: ["pradesh_eng_name", "pradesh_guj_name"],
          },
        ],
      });

      // Group by pradesh_id and calculate totals
      const pradeshTotals = {};
      stockData.forEach((record) => {
        const pradeshId = record.pradesh_id;
        if (!pradeshTotals[pradeshId]) {
          pradeshTotals[pradeshId] = {
            pradesh_id: pradeshId,
            pradesh_eng_name: record.pradesh?.pradesh_eng_name || "Unknown",
            pradesh_guj_name: record.pradesh?.pradesh_guj_name || "Unknown",
            total_qty: 0,
            totalassigned: 0,
            stock_records_count: 0,
          };
        }
        const qty = parseFloat(record.food_qty || 0);
        pradeshTotals[pradeshId].total_qty += qty;
        if (qty > 0) {
          pradeshTotals[pradeshId].totalassigned += qty;
        }
        pradeshTotals[pradeshId].stock_records_count += 1;
      });

      const pradeshStockData = Object.values(pradeshTotals);

      successResponse(res, {
        msg: "Food item pradesh-wise stock totals retrieved successfully",
        food_item: {
          food_item_id: foodItem.food_item_id,
          food_eng_name: foodItem.food_eng_name,
          food_guj_name: foodItem.food_guj_name,
          food_unit: foodItem.food_unit,
          food_category: foodItem.food_category,
        },
        pradesh_stock: pradeshStockData,
        total_pradesh_count: pradeshStockData.length,
      });
    } else {
      // Get all food items with pradesh-wise stock totals
      const foodItems = await db.foodItems.findAll({
        where: { status: "active" },
        order: [
          ["food_category", "ASC"],
          ["food_item_id", "ASC"],
        ],
      });

      const itemsWithPradeshStock = await Promise.all(
        foodItems.map(async (item) => {
          let stockWhereClause = { food_item_id: item.food_item_id };

          if (event_id) {
            stockWhereClause.event_id = event_id;
          }

          const stockData = await db.foodStock.findAll({
            where: stockWhereClause,
            attributes: ["pradesh_id", "food_qty"],
            include: [
              {
                model: db.pradesh,
                as: "pradesh",
                attributes: ["pradesh_eng_name", "pradesh_guj_name"],
              },
            ],
          });

          // Group by pradesh_id and calculate totals
          const pradeshTotals = {};
          stockData.forEach((record) => {
            const pradeshId = record.pradesh_id;
            if (!pradeshTotals[pradeshId]) {
              pradeshTotals[pradeshId] = {
                pradesh_id: pradeshId,
                pradesh_eng_name: record.pradesh?.pradesh_eng_name || "Unknown",
                pradesh_guj_name: record.pradesh?.pradesh_guj_name || "Unknown",
                total_qty: 0,
                totalassigned: 0,
                stock_records_count: 0,
              };
            }
            const qty = parseFloat(record.food_qty || 0);
            pradeshTotals[pradeshId].total_qty += qty;
            if (qty > 0) {
              pradeshTotals[pradeshId].totalassigned += qty;
            }
            pradeshTotals[pradeshId].stock_records_count += 1;
          });

          const pradeshStockData = Object.values(pradeshTotals);

          return {
            food_item_id: item.food_item_id,
            food_eng_name: item.food_eng_name,
            food_guj_name: item.food_guj_name,
            food_unit: item.food_unit,
            food_category: item.food_category,
            pradesh_stock: pradeshStockData,
            total_pradesh_count: pradeshStockData.length,
          };
        })
      );

      successResponse(res, {
        msg: "All food items with pradesh-wise stock totals retrieved successfully",
        count: itemsWithPradeshStock.length,
        data: itemsWithPradeshStock,
      });
    }
  } catch (error) {
    console.error("Error fetching pradesh-wise stock data:", error);
    errorResponse(res, error.message);
  }
};

export const getPradeshItems = async (req, res) => {
  try {
    const { pradesh_id } = req.body;

    if (pradesh_id) {
      // Get specific pradesh
      const pradesh = await db.pradesh.findByPk(pradesh_id);
      if (!pradesh) {
        return errorResponse(res, "Pradesh not found.");
      }

      // Get ALL active events first
      const allEvents = await db.event.findAll({
        where: { status: ["active", "inactive"] }, // Include active and inactive events
        attributes: [
          "event_id",
          "event_name",
          "event_desc",
          "event_location",
          "event_date",
          "event_max_prasad_date",
          "event_item_last_date",
          "is_prasad_active",
          "status",
          "cdt",
          "udt",
        ],
        order: [["event_id", "DESC"]],
      });

      // Fetch all stock records for this pradesh (all events)
      const stockData = await db.foodStock.findAll({
        where: { pradesh_id },
        attributes: ["event_id", "food_item_id", "food_qty"],
        include: [
          {
            model: db.foodItems,
            as: "foodItem",
            attributes: [
              "food_eng_name",
              "food_guj_name",
              "food_unit",
              "food_category",
            ],
          },
        ],
      });

      // Group stock data by event_id and food_item_id
      const eventWiseStockTotals = {};
      stockData.forEach((record) => {
        const eventId = record.event_id;

        if (!eventWiseStockTotals[eventId]) {
          eventWiseStockTotals[eventId] = {};
        }

        const foodItemId = record.food_item_id;
        if (!eventWiseStockTotals[eventId][foodItemId]) {
          eventWiseStockTotals[eventId][foodItemId] = {
            food_item_id: foodItemId,
            food_eng_name: record.foodItem?.food_eng_name || "Unknown",
            food_guj_name: record.foodItem?.food_guj_name || "Unknown",
            food_unit: record.foodItem?.food_unit || "Unknown",
            food_category: record.foodItem?.food_category || "Unknown",
            total_qty: 0,
            totalassigned: 0,
            stock_records_count: 0,
          };
        }

        const qty = parseFloat(record.food_qty || 0);
        eventWiseStockTotals[eventId][foodItemId].total_qty += qty;
        if (qty > 0) {
          eventWiseStockTotals[eventId][foodItemId].totalassigned += qty;
        }
        eventWiseStockTotals[eventId][foodItemId].stock_records_count += 1;
      });

      // Build response with ALL events, including those with no food items
      const eventWiseItems = await Promise.all(
        allEvents.map(async (event) => {
          // Get stock items for this event (if any)
          const eventItems = eventWiseStockTotals[event.event_id] || {};

          // Fetch prasadStock for this event+pradesh
          const prasadStock = await db.prasadStock.findOne({
            where: {
              event_id: event.event_id,
              pradesh_id,
            },
          });

          return {
            event_id: event.event_id,
            event_name: event.event_name,
            event_desc: event.event_desc,
            event_location: event.event_location,
            event_date: event.event_date,
            event_max_prasad_date: event.event_max_prasad_date,
            event_item_last_date: event.event_item_last_date,
            is_prasad_active: event.is_prasad_active,
            status: event.status,
            cdt: event.cdt,
            udt: event.udt,
            prasadStock: prasadStock || null,
            items: Object.values(eventItems), // Empty array if no items
            total_items_count: Object.values(eventItems).length, // 0 if no items
          };
        })
      );

      successResponse(res, {
        msg: "Pradesh items with stock totals retrieved successfully (event-wise)",
        pradesh: {
          pradesh_id: pradesh.pradesh_id,
          pradesh_eng_name: pradesh.pradesh_eng_name,
          pradesh_guj_name: pradesh.pradesh_guj_name,
          status: pradesh.status,
        },
        events: eventWiseItems,
      });
    } else {
      // Get all pradesh
      const pradeshList = await db.pradesh.findAll({
        where: { status: "active" },
        order: [["pradesh_id", "ASC"]],
      });

      // Get ALL active events first
      const allEvents = await db.event.findAll({
        where: { status: ["active", "inactive"] },
        attributes: [
          "event_id",
          "event_name",
          "event_desc",
          "event_location",
          "event_date",
          "event_max_prasad_date",
          "event_item_last_date",
          "is_prasad_active",
          "status",
          "cdt",
          "udt",
        ],
        order: [["event_id", "DESC"]],
      });

      const pradeshWithItems = await Promise.all(
        pradeshList.map(async (pradesh) => {
          // Get pradesh users by splitting comma-separated user_ids
          let pradeshUsers = [];
          if (pradesh.user_ids) {
            const userIds = pradesh.user_ids
              .split(",")
              .map((id) => parseInt(id.trim()))
              .filter((id) => !isNaN(id));

            if (userIds.length > 0) {
              pradeshUsers = await db.user.findAll({
                where: {
                  user_id: {
                    [db.Sequelize.Op.in]: userIds,
                  },
                },
              });
            }
          }

          // Get stock data for this pradesh
          const stockData = await db.foodStock.findAll({
            where: { pradesh_id: pradesh.pradesh_id },
            attributes: ["event_id", "food_item_id", "food_qty"],
            include: [
              {
                model: db.foodItems,
                as: "foodItem",
                attributes: [
                  "food_eng_name",
                  "food_guj_name",
                  "food_unit",
                  "food_category",
                ],
              },
            ],
          });

          // Group stock data by event_id and food_item_id
          const eventWiseStockTotals = {};
          stockData.forEach((record) => {
            const eventId = record.event_id;

            if (!eventWiseStockTotals[eventId]) {
              eventWiseStockTotals[eventId] = {};
            }

            const foodItemId = record.food_item_id;
            if (!eventWiseStockTotals[eventId][foodItemId]) {
              eventWiseStockTotals[eventId][foodItemId] = {
                food_item_id: foodItemId,
                food_eng_name: record.foodItem?.food_eng_name || "Unknown",
                food_guj_name: record.foodItem?.food_guj_name || "Unknown",
                food_unit: record.foodItem?.food_unit || "Unknown",
                food_category: record.foodItem?.food_category || "Unknown",
                total_qty: 0,
                totalassigned: 0,
                stock_records_count: 0,
              };
            }

            const qty = parseFloat(record.food_qty || 0);
            eventWiseStockTotals[eventId][foodItemId].total_qty += qty;
            if (qty > 0) {
              eventWiseStockTotals[eventId][foodItemId].totalassigned += qty;
            }
            eventWiseStockTotals[eventId][foodItemId].stock_records_count += 1;
          });

          // Build events array with ALL events
          const eventWiseItems = await Promise.all(
            allEvents.map(async (event) => {
              // Get stock items for this event (if any)
              const eventItems = eventWiseStockTotals[event.event_id] || {};

              // Fetch prasadStock for this event+pradesh
              const prasadStock = await db.prasadStock.findOne({
                where: {
                  event_id: event.event_id,
                  pradesh_id: pradesh.pradesh_id,
                },
              });

              return {
                event_id: event.event_id,
                event_name: event.event_name,
                event_desc: event.event_desc,
                event_location: event.event_location,
                event_date: event.event_date,
                event_max_prasad_date: event.event_max_prasad_date,
                event_item_last_date: event.event_item_last_date,
                is_prasad_active: event.is_prasad_active,
                status: event.status,
                cdt: event.cdt,
                udt: event.udt,
                prasadStock: prasadStock || null,
                items: Object.values(eventItems), // Empty array if no items
                total_items_count: Object.values(eventItems).length, // 0 if no items
              };
            })
          );

          return {
            pradesh_id: pradesh.pradesh_id,
            pradesh_eng_name: pradesh.pradesh_eng_name,
            pradesh_guj_name: pradesh.pradesh_guj_name,
            status: pradesh.status,
            pradeshUsers,
            events: eventWiseItems,
          };
        })
      );

      successResponse(res, {
        msg: "All pradesh with items and stock totals retrieved successfully (event-wise)",
        count: pradeshWithItems.length,
        data: pradeshWithItems,
      });
    }
  } catch (error) {
    console.error("Error fetching pradesh items data:", error);
    errorResponse(res, error.message);
  }
};

export const getDefaultPradeshItems = async (req, res) => {
  try {
    const { pradesh_id } = req.body;

    if (pradesh_id) {
      // Get specific pradesh
      const pradesh = await db.pradesh.findByPk(pradesh_id);
      if (!pradesh) {
        return errorResponse(res, "Pradesh not found.");
      }

      // Get ALL events first, so events without default stock still appear
      const allEvents = await db.event.findAll({
        where: { status: ["active", "inactive"] },
        attributes: [
          "event_id",
          "event_name",
          "event_desc",
          "event_location",
          "event_date",
          "event_max_prasad_date",
          "event_item_last_date",
          "is_prasad_active",
          "status",
          "cdt",
          "udt",
        ],
        order: [["event_id", "DESC"]],
      });

      // fetch all stock records (all events)
      const stockData = await db.defaultStock.findAll({
        where: { pradesh_id },
        attributes: ["id", "event_id", "food_item_id", "food_qty"],
        include: [
          {
            model: db.foodItems,
            as: "foodItem",
            attributes: [
              "food_eng_name",
              "food_guj_name",
              "food_unit",
              "food_category",
            ],
          },
        ],
      });

      // Group by event_id and food_item_id
      const eventWiseTotals = {};
      stockData.forEach((record) => {
        const eventId = record.event_id;

        if (!eventWiseTotals[eventId]) {
          eventWiseTotals[eventId] = {};
        }

        const foodItemId = record.food_item_id;
        if (!eventWiseTotals[eventId][foodItemId]) {
          eventWiseTotals[eventId][foodItemId] = {
            id: record.id,
            food_item_id: foodItemId,
            food_eng_name: record.foodItem?.food_eng_name || "Unknown",
            food_guj_name: record.foodItem?.food_guj_name || "Unknown",
            food_unit: record.foodItem?.food_unit || "Unknown",
            food_category: record.foodItem?.food_category || "Unknown",
            total_qty: 0,
            totalassigned: 0,
            stock_records_count: 0,
          };
        }

        const qty = parseFloat(record.food_qty || 0);
        eventWiseTotals[eventId][foodItemId].total_qty += qty;
        if (qty > 0) {
          eventWiseTotals[eventId][foodItemId].totalassigned += qty;
        }
        eventWiseTotals[eventId][foodItemId].stock_records_count += 1;
      });

      // Build response with ALL events, including those with no default stock
      const eventWiseItems = await Promise.all(
        allEvents.map(async (event) => {
          // Get default stock items for this event (if any)
          const eventItems = eventWiseTotals[event.event_id] || {};

          // Check if all default stock items for this event+pradesh exist in foodStock
          const defaultItemIds = Object.keys(eventItems).map((id) =>
            parseInt(id)
          );

          let allItemsCopied = false;
          if (defaultItemIds.length > 0) {
            const copiedFoodStockItems = await db.foodStock.findAll({
              where: {
                pradesh_id: pradesh_id,
                event_id: event.event_id,
                food_item_id: {
                  [db.Sequelize.Op.in]: defaultItemIds,
                },
              },
              attributes: ["food_item_id"],
            });

            const copiedItemIds = copiedFoodStockItems.map(
              (item) => item.food_item_id
            );
            allItemsCopied = defaultItemIds.every((itemId) =>
              copiedItemIds.includes(itemId)
            );
          }

          return {
            event_id: event.event_id,
            event_name: event.event_name,
            event_desc: event.event_desc,
            event_location: event.event_location,
            event_date: event.event_date,
            event_max_prasad_date: event.event_max_prasad_date,
            event_item_last_date: event.event_item_last_date,
            is_prasad_active: event.is_prasad_active,
            status: event.status,
            cdt: event.cdt,
            udt: event.udt,
            is_message: allItemsCopied,
            items: Object.values(eventItems), // Empty array if no items
            total_items_count: Object.values(eventItems).length, // 0 if no items
          };
        })
      );

      successResponse(res, {
        msg: "Pradesh default stock items retrieved successfully (event-wise)",
        pradesh: {
          pradesh_id: pradesh.pradesh_id,
          pradesh_eng_name: pradesh.pradesh_eng_name,
          pradesh_guj_name: pradesh.pradesh_guj_name,
          status: pradesh.status,
        },
        events: eventWiseItems,
      });
    } else {
      // Get all pradesh
      const pradeshList = await db.pradesh.findAll({
        where: { status: "active" },
        order: [["pradesh_id", "ASC"]],
      });

      // Get ALL events first, so events without default stock still appear
      const allEvents = await db.event.findAll({
        where: { status: ["active", "inactive"] },
        attributes: [
          "event_id",
          "event_name",
          "event_desc",
          "event_location",
          "event_date",
          "event_max_prasad_date",
          "event_item_last_date",
          "is_prasad_active",
          "status",
          "cdt",
          "udt",
        ],
        order: [["event_id", "DESC"]],
      });

      const pradeshWithItems = await Promise.all(
        pradeshList.map(async (pradesh) => {
          // Get pradesh users by splitting comma-separated user_ids
          let pradeshUsers = [];
          if (pradesh.user_ids) {
            const userIds = pradesh.user_ids
              .split(",")
              .map((id) => parseInt(id.trim()))
              .filter((id) => !isNaN(id));

            if (userIds.length > 0) {
              pradeshUsers = await db.user.findAll({
                where: {
                  user_id: {
                    [db.Sequelize.Op.in]: userIds,
                  },
                },
              });
            }
          }

          const stockData = await db.defaultStock.findAll({
            where: { pradesh_id: pradesh.pradesh_id },
            attributes: ["id", "event_id", "food_item_id", "food_qty"],
            include: [
              {
                model: db.foodItems,
                as: "foodItem",
                attributes: [
                  "food_eng_name",
                  "food_guj_name",
                  "food_unit",
                  "food_category",
                ],
              },
            ],
          });

          const eventWiseTotals = {};
          stockData.forEach((record) => {
            const eventId = record.event_id;

            if (!eventWiseTotals[eventId]) {
              eventWiseTotals[eventId] = {};
            }

            const foodItemId = record.food_item_id;
            if (!eventWiseTotals[eventId][foodItemId]) {
              eventWiseTotals[eventId][foodItemId] = {
                id: record.id,
                food_item_id: foodItemId,
                food_eng_name: record.foodItem?.food_eng_name || "Unknown",
                food_guj_name: record.foodItem?.food_guj_name || "Unknown",
                food_unit: record.foodItem?.food_unit || "Unknown",
                food_category: record.foodItem?.food_category || "Unknown",
                total_qty: 0,
                totalassigned: 0,
                stock_records_count: 0,
              };
            }

            const qty = parseFloat(record.food_qty || 0);
            eventWiseTotals[eventId][foodItemId].total_qty += qty;
            if (qty > 0) {
              eventWiseTotals[eventId][foodItemId].totalassigned += qty;
            }
            eventWiseTotals[eventId][foodItemId].stock_records_count += 1;
          });

          // Build events array with ALL events
          const eventWiseItems = await Promise.all(
            allEvents.map(async (event) => {
              // Get default stock items for this event (if any)
              const eventItems = eventWiseTotals[event.event_id] || {};

              // Check if all default stock items for this event+pradesh exist in foodStock
              const defaultItemIds = Object.keys(eventItems).map((id) =>
                parseInt(id)
              );

              let allItemsCopied = false;
              if (defaultItemIds.length > 0) {
                const copiedFoodStockItems = await db.foodStock.findAll({
                  where: {
                    pradesh_id: pradesh.pradesh_id,
                    event_id: event.event_id,
                    food_item_id: {
                      [db.Sequelize.Op.in]: defaultItemIds,
                    },
                  },
                  attributes: ["food_item_id"],
                });

                const copiedItemIds = copiedFoodStockItems.map(
                  (item) => item.food_item_id
                );
                allItemsCopied = defaultItemIds.every((itemId) =>
                  copiedItemIds.includes(itemId)
                );
              }

              return {
                event_id: event.event_id,
                event_name: event.event_name,
                event_desc: event.event_desc,
                event_location: event.event_location,
                event_date: event.event_date,
                event_max_prasad_date: event.event_max_prasad_date,
                event_item_last_date: event.event_item_last_date,
                is_prasad_active: event.is_prasad_active,
                status: event.status,
                cdt: event.cdt,
                udt: event.udt,
                is_message: allItemsCopied,
                items: Object.values(eventItems), // Empty array if no items
                total_items_count: Object.values(eventItems).length, // 0 if no items
              };
            })
          );

          return {
            pradesh_id: pradesh.pradesh_id,
            pradesh_eng_name: pradesh.pradesh_eng_name,
            pradesh_guj_name: pradesh.pradesh_guj_name,
            status: pradesh.status,
            pradeshUsers,
            events: eventWiseItems,
          };
        })
      );

      successResponse(res, {
        msg: "All pradesh with default stock items retrieved successfully (event-wise)",
        count: pradeshWithItems.length,
        data: pradeshWithItems,
      });
    }
  } catch (error) {
    console.error("Error fetching pradesh default items data:", error);
    errorResponse(res, error.message);
  }
};

export const copyDefaultStockToFoodStock = async (req, res) => {
  const transaction = await db.sequelize.transaction();

  try {
    console.log("=== COPY DEFAULT STOCK TO FOOD STOCK API ===");
    console.log("Request body:", req.body);

    const { pradesh_id, event_id } = req.body;

    if (!pradesh_id || !event_id) {
      await transaction.rollback();
      console.log("❌ Validation failed: pradesh_id and event_id are required");
      return errorResponse(res, "pradesh_id and event_id are required.");
    }

    console.log(
      `✅ Parameters: pradesh_id=${pradesh_id}, event_id=${event_id}`
    );

    // Check pradesh exists
    const pradesh = await db.pradesh.findByPk(pradesh_id, { transaction });
    if (!pradesh) {
      await transaction.rollback();
      console.log("❌ Pradesh not found");
      return errorResponse(res, "Pradesh not found.");
    }

    // Check event exists
    const event = await db.event.findByPk(event_id, { transaction });
    if (!event) {
      await transaction.rollback();
      console.log("❌ Event not found");
      return errorResponse(res, "Event not found.");
    }

    console.log(
      `✅ Pradesh: ${pradesh.pradesh_eng_name}, Event: ${event.event_name}`
    );

    // Fetch default stock for given pradesh + event
    console.log("📋 Step 1: Fetching default stock records...");
    const defaultStocks = await db.defaultStock.findAll({
      where: { pradesh_id, event_id, status: "active" },
      transaction,
    });

    if (!defaultStocks.length) {
      await transaction.rollback();
      console.log("❌ No default stock found");
      return errorResponse(
        res,
        "No default stock found for this pradesh and event."
      );
    }

    console.log(`✅ Found ${defaultStocks.length} default stock records`);

    // Check existing food stock records for this pradesh + event
    console.log("📋 Step 2: Checking existing food stock records...");
    const existingFoodStocks = await db.foodStock.findAll({
      where: { pradesh_id, event_id },
      transaction,
    });

    // Create a map of existing records by food_item_id for quick lookup
    const existingFoodStockMap = {};
    existingFoodStocks.forEach((record) => {
      existingFoodStockMap[record.food_item_id] = record;
    });

    console.log(
      `✅ Found ${existingFoodStocks.length} existing food stock records`
    );

    let updatedCount = 0;
    let createdCount = 0;

    console.log("📋 Step 3: Processing upsert operations...");

    // Process each default stock record
    for (let i = 0; i < defaultStocks.length; i++) {
      const defaultRecord = defaultStocks[i];
      const foodItemId = defaultRecord.food_item_id;

      console.log(
        `📝 Processing record ${i + 1}/${
          defaultStocks.length
        } for food_item_id: ${foodItemId}`
      );

      const stockData = {
        pradesh_id,
        event_id,
        food_item_id: defaultRecord.food_item_id,
        food_qty: defaultRecord.food_qty,
        person_name: defaultRecord.person_name,
        person_mobile: defaultRecord.person_mobile,
        type: "DR",
        status: "active",
        udt: new Date(), // Update timestamp
      };

      if (existingFoodStockMap[foodItemId]) {
        // Update existing record
        console.log(
          `🔄 Updating existing record for food_item_id: ${foodItemId}`
        );

        await db.foodStock.update(stockData, {
          where: {
            pradesh_id,
            event_id,
            food_item_id: foodItemId,
          },
          transaction,
        });
        updatedCount++;

        console.log(`✅ Updated record ${i + 1}/${defaultStocks.length}`);
      } else {
        // Create new record
        console.log(`➕ Creating new record for food_item_id: ${foodItemId}`);

        stockData.cdt = new Date(); // Set creation timestamp

        await db.foodStock.create(stockData, { transaction });
        createdCount++;

        console.log(`✅ Created record ${i + 1}/${defaultStocks.length}`);
      }
    }

    // Commit transaction
    await transaction.commit();
    console.log(`🎉 Transaction completed successfully!`);

    const responseData = {
      msg: "Default stock processed successfully to foodStock.",
      pradesh_details: {
        pradesh_id: pradesh.pradesh_id,
        pradesh_eng_name: pradesh.pradesh_eng_name,
        pradesh_guj_name: pradesh.pradesh_guj_name,
      },
      event_details: {
        event_id: event.event_id,
        event_name: event.event_name,
        event_date: event.event_date,
      },
      operation_summary: {
        total_default_records: defaultStocks.length,
        records_created: createdCount,
        records_updated: updatedCount,
        total_processed: createdCount + updatedCount,
      },
    };

    console.log("📤 Sending success response");
    successResponse(res, responseData);
  } catch (error) {
    // Rollback transaction on error
    await transaction.rollback();
    console.error("❌ TRANSACTION ROLLED BACK");
    console.error("Error copying stock:", {
      name: error.name,
      message: error.message,
      stack: error.stack,
    });

    errorResponse(res, `Failed to copy default stock: ${error.message}`);
  }
};

export const createNewEvent = async (req, res) => {
  const transaction = await db.sequelize.transaction();

  try {
    console.log("=== CREATE NEW EVENT API ===");
    console.log("Request body:", req.body);
    console.log("Content-Type:", req.headers["content-type"]);

    const eventData = req.body;

    // Validate required event data
    if (
      !eventData ||
      !eventData.event_name ||
      eventData.event_name.trim() === ""
    ) {
      await transaction.rollback();
      console.log("❌ Validation failed: Event name is required");
      return errorResponse(res, "Event name is required.");
    }

    console.log("✅ Event name validation passed:", eventData.event_name);

    // Step 1: Find the last event created in the event table
    console.log("📋 Step 1: Finding last event...");
    const lastEvent = await db.event.findOne({
      where: {
        status: ["active", "inactive"], // Exclude deleted events
      },
      order: [["event_id", "DESC"]],
      transaction,
    });

    if (!lastEvent) {
      await transaction.rollback();
      console.log("❌ No previous event found");
      return errorResponse(res, "No previous event found to copy stock from.");
    }

    const lastEventId = lastEvent.event_id;
    console.log(
      `✅ Found last event: ID=${lastEventId}, Name="${lastEvent.event_name}"`
    );

    // Step 2: Get all data from food_stock where event_id = lastEventId and food_qty > 0 (credit entries)
    console.log("📋 Step 2: Finding food stock records to copy...");
    const foodStockRecords = await db.foodStock.findAll({
      where: {
        event_id: lastEventId,
        food_qty: {
          [db.Sequelize.Op.gt]: 0, // Positive quantity (credit entries)
        },
        status: "active",
      },
      transaction,
    });

    console.log(foodStockRecords);

    // ✅ Now set them inactive
    // if (foodStockRecords.length > 0) {
    //   await db.foodStock.update(
    //     { status: "inactive" },
    //     {
    //       where: {
    //         id: foodStockRecords.map((r) => r.id),
    //       },
    //       transaction,
    //     }
    //   );
    // }

    console.log(
      `✅ Found ${foodStockRecords.length} food stock records with positive quantities`
    );

    // if (foodStockRecords.length > 0) {
    //   console.log("📊 Sample food stock record:", {
    //     event_id: foodStockRecords[0].event_id,
    //     pradesh_id: foodStockRecords[0].pradesh_id,
    //     food_item_id: foodStockRecords[0].food_item_id,
    //     food_qty: foodStockRecords[0].food_qty,
    //     person_name: foodStockRecords[0].person_name,
    //   });
    // }

    // Step 3: Create the new event
    console.log("📋 Step 3: Creating new event...");
    const newEvent = await db.event.create(
      {
        event_name: eventData.event_name,
        event_desc: eventData.event_desc || null,
        event_location: eventData.event_location || null,
        event_max_prasad_date: eventData.event_max_prasad_date || null,
        event_date: eventData.event_date || null,
        event_item_last_date: eventData.event_item_last_date || null,
        is_prasad_active: eventData.is_prasad_active || false,
        status: eventData.status || "active",
        cdt: new Date(),
        udt: new Date(),
      },
      { transaction }
    );

    const newEventId = newEvent.event_id;
    console.log(
      `✅ Created new event: ID=${newEventId}, Name="${newEvent.event_name}"`
    );

    // Step 4: Copy food stock records to default_stock table with new event_id
    let copiedRecords = 0;

    if (foodStockRecords.length > 0) {
      console.log(
        `📋 Step 4: Copying ${foodStockRecords.length} records from food_stock to default_stock...`
      );

      for (let i = 0; i < foodStockRecords.length; i++) {
        const stock = foodStockRecords[i];

        try {
          const defaultStockData = {
            event_id: newEventId, // New event ID
            pradesh_id: stock.pradesh_id,
            food_item_id: stock.food_item_id,
            food_qty: stock.food_qty,
            person_mobile: eventData.person_name,
            person_name: eventData.mobile,
            status: "active",
            cdt: new Date(),
            udt: new Date(),
          };

          console.log(
            `📝 Inserting record ${i + 1}/${foodStockRecords.length}:`,
            {
              event_id: defaultStockData.event_id,
              pradesh_id: defaultStockData.pradesh_id,
              food_item_id: defaultStockData.food_item_id,
              food_qty: defaultStockData.food_qty,
            }
          );

          await db.defaultStock.create(defaultStockData, { transaction });
          copiedRecords++;

          console.log(
            `✅ Successfully inserted record ${i + 1}/${
              foodStockRecords.length
            }`
          );
        } catch (insertError) {
          console.error(
            `❌ Error inserting record ${i + 1}:`,
            insertError.message
          );
          console.error("Failed record details:", {
            original_event_id: stock.event_id,
            new_event_id: newEventId,
            pradesh_id: stock.pradesh_id,
            food_item_id: stock.food_item_id,
            food_qty: stock.food_qty,
          });

          // Check if it's a foreign key constraint error
          if (insertError.name === "SequelizeForeignKeyConstraintError") {
            throw new Error(
              `Foreign key constraint failed for record ${
                i + 1
              }. Check if pradesh_id (${stock.pradesh_id}) or food_item_id (${
                stock.food_item_id
              }) exists in their respective tables.`
            );
          }

          throw new Error(
            `Failed to copy record ${i + 1} to default_stock: ${
              insertError.message
            }`
          );
        }
      }
    } else {
      console.log("ℹ️ No food stock records found to copy");
    }

    // Commit the transaction
    await transaction.commit();
    console.log(
      `🎉 Transaction committed successfully! Copied ${copiedRecords} records.`
    );

    const responseData = {
      msg: "New event created successfully with stock data copied from food_stock to default_stock.",
      new_event: {
        event_id: newEventId,
        event_name: newEvent.event_name,
        event_desc: newEvent.event_desc,
        event_location: newEvent.event_location,
        status: newEvent.status,
      },
      source_event: {
        event_id: lastEventId,
        event_name: lastEvent.event_name,
      },
      copy_summary: {
        total_food_stock_records: foodStockRecords.length,
        successfully_copied_to_default_stock: copiedRecords,
      },
    };

    console.log("📤 Sending success response:", responseData);
    successResponse(res, responseData);
  } catch (error) {
    // Rollback the transaction in case of error
    await transaction.rollback();
    console.error("❌ TRANSACTION ROLLED BACK");
    console.error("Full error details:", {
      name: error.name,
      message: error.message,
      stack: error.stack,
    });

    errorResponse(res, `Transaction failed: ${error.message}`);
  }
};

export const getFoodStockByPerson = async (req, res) => {
  try {
    console.log("=== GET FOOD STOCK BY PERSON API ===");
    console.log("Request query/body:", req.query, req.body);

    // Get parameters from query params or body
    const { pradesh_id, event_id } = req.query.pradesh_id
      ? req.query
      : req.body;

    // Validate required parameters
    if (!pradesh_id) {
      console.log("❌ Validation failed: pradesh_id is required");
      return errorResponse(res, "pradesh_id is required.");
    }

    if (!event_id) {
      console.log("❌ Validation failed: event_id is required");
      return errorResponse(res, "event_id is required.");
    }

    console.log(
      `✅ Parameters validated: pradesh_id=${pradesh_id}, event_id=${event_id}`
    );

    // Fetch all food stock records for the given pradesh_id and event_id
    console.log("📋 Step 1: Fetching food stock records...");
    const foodStockRecords = await db.foodStock.findAll({
      where: {
        type: "DR",
        pradesh_id: pradesh_id,
        event_id: event_id,
        status: "active",
        person_mobile: {
          [db.Sequelize.Op.ne]: null, // Only records with mobile numbers
        },
      },
      include: [
        {
          model: db.pradesh,
          as: "pradesh",
          attributes: [
            "pradesh_id",
            "pradesh_eng_name",
            "pradesh_guj_name",
            "pradesh_old_eng_name",
            "pradesh_new_guj_name",
            "user_ids",
            "status",
            "cdt",
            "udt",
          ],
        },
        {
          model: db.event,
          as: "event",
          attributes: [
            "event_id",
            "event_name",
            "event_desc",
            "event_location",
            "event_date",
          ],
        },
        {
          model: db.foodItems,
          as: "foodItem",
          attributes: [
            "food_item_id",
            "food_eng_name",
            "food_guj_name",
            "food_unit",
            "food_image_url",
            "food_category",
            "food_remark",
            "status",
            "cdt",
            "udt",
          ],
        },
      ],
      order: [
        ["person_mobile", "ASC"],
        ["person_name", "ASC"],
        ["food_item_id", "ASC"],
      ],
    });

    console.log(`✅ Found ${foodStockRecords.length} food stock records`);

    if (foodStockRecords.length === 0) {
      console.log("ℹ️ No food stock records found for the given criteria");
      return successResponse(res, {
        msg: "No food stock records found for the given pradesh_id and event_id.",
        pradesh_id: parseInt(pradesh_id),
        event_id: parseInt(event_id),
        total_records: 0,
        data: [],
      });
    }

    // Group records by person_mobile
    console.log("📋 Step 2: Grouping records by person_mobile...");
    const groupedByPerson = {};
    let totalQuantity = 0;
    let creditQuantity = 0;
    let debitQuantity = 0;
    let pradeshDetails = null; // Store pradesh details once
    let eventDetails = null; // Store event details once

    foodStockRecords.forEach((record) => {
      const mobile = record.person_mobile;

      // Capture pradesh and event details from first record (they'll be same for all)
      if (!pradeshDetails && record.pradesh) {
        pradeshDetails = {
          pradesh_id: record.pradesh.pradesh_id,
          pradesh_eng_name: record.pradesh.pradesh_eng_name,
          pradesh_guj_name: record.pradesh.pradesh_guj_name,
          pradesh_old_eng_name: record.pradesh.pradesh_old_eng_name,
          pradesh_new_guj_name: record.pradesh.pradesh_new_guj_name,
          user_ids: record.pradesh.user_ids,
          status: record.pradesh.status,
          cdt: record.pradesh.cdt,
          udt: record.pradesh.udt,
        };
      }

      if (!eventDetails && record.event) {
        eventDetails = {
          event_id: record.event.event_id,
          event_name: record.event.event_name,
          event_desc: record.event.event_desc,
          event_location: record.event.event_location,
          event_date: record.event.event_date,
        };
      }

      if (!groupedByPerson[mobile]) {
        groupedByPerson[mobile] = {
          person_details: {
            person_mobile: record.person_mobile,
            person_name: record.person_name,
          },
          food_items: [],
          summary: {
            total_items: 0,
            total_quantity: 0,
            credit_quantity: 0,
            debit_quantity: 0,
            credit_items: 0,
            debit_items: 0,
          },
        };
      }

      // Add food item details
      const quantity = parseFloat(record.food_qty);
      const foodItemData = {
        food_item_id: record.food_item_id,
        food_item_details: record.foodItem
          ? {
              food_item_id: record.foodItem.food_item_id,
              food_eng_name: record.foodItem.food_eng_name,
              food_guj_name: record.foodItem.food_guj_name,
              food_unit: record.foodItem.food_unit,
              food_image_url: record.foodItem.food_image_url,
              food_category: record.foodItem.food_category,
              food_remark: record.foodItem.food_remark,
              status: record.foodItem.status,
              cdt: record.foodItem.cdt,
              udt: record.foodItem.udt,
            }
          : null,
        food_qty: record.food_qty,
        type: record.type,
        cdt: record.cdt,
        udt: record.udt,
      };

      groupedByPerson[mobile].food_items.push(foodItemData);

      // Update summaries
      groupedByPerson[mobile].summary.total_items++;
      groupedByPerson[mobile].summary.total_quantity += quantity;

      if (record.type === "cr") {
        groupedByPerson[mobile].summary.credit_quantity += quantity;
        groupedByPerson[mobile].summary.credit_items++;
        creditQuantity += quantity;
      } else if (record.type === "dr") {
        groupedByPerson[mobile].summary.debit_quantity += Math.abs(quantity);
        groupedByPerson[mobile].summary.debit_items++;
        debitQuantity += Math.abs(quantity);
      }

      totalQuantity += quantity;
    });

    // Convert grouped object to array
    const personWiseData = Object.values(groupedByPerson);

    // Sort by person name for consistent ordering
    personWiseData.sort((a, b) => {
      const nameA = a.person_details.person_name || "";
      const nameB = b.person_details.person_name || "";
      return nameA.localeCompare(nameB);
    });

    console.log(`✅ Grouped into ${personWiseData.length} unique persons`);
    console.log("📊 Sample person data:", {
      person_mobile: personWiseData[0]?.person_details.person_mobile,
      person_name: personWiseData[0]?.person_details.person_name,
      total_items: personWiseData[0]?.summary.total_items,
      total_quantity: personWiseData[0]?.summary.total_quantity,
    });

    // Prepare response
    const responseData = {
      msg: "Food stock records retrieved successfully, grouped by person mobile.",
      filter_criteria: {
        pradesh_id: parseInt(pradesh_id),
        event_id: parseInt(event_id),
      },
      pradesh_details: pradeshDetails,
      event_details: eventDetails,
      overall_summary: {
        total_unique_persons: personWiseData.length,
        total_food_records: foodStockRecords.length,
        total_quantity: parseFloat(totalQuantity.toFixed(2)),
        total_credit_quantity: parseFloat(creditQuantity.toFixed(2)),
        total_debit_quantity: parseFloat(debitQuantity.toFixed(2)),
        net_quantity: parseFloat(totalQuantity.toFixed(2)),
      },
      person_wise_data: personWiseData,
    };

    console.log("📤 Sending success response with grouped data");
    successResponse(res, responseData);
  } catch (error) {
    console.error("❌ ERROR in getFoodStockByPerson:", {
      name: error.name,
      message: error.message,
      stack: error.stack,
    });

    errorResponse(res, `Failed to fetch food stock data: ${error.message}`);
  }
};

export const getPrasadStock = async (req, res) => {
  try {
    console.log("=== GET PRASAD STOCK API ===");
    console.log("Request query/body:", req.query, req.body);

    // Get parameters from query params or body
    const { pradesh_id, event_id } = req.query.pradesh_id
      ? req.query
      : req.body;

    // Build where conditions for pradesh
    let pradeshWhereConditions = {
      status: "active",
    };

    // Add pradesh filter if provided
    if (pradesh_id) {
      pradeshWhereConditions.pradesh_id = pradesh_id;
      console.log(`🔍 Filtering by pradesh_id: ${pradesh_id}`);
    }

    console.log("📋 Step 1: Fetching all pradesh records...");

    // First, get all pradesh records (main table)
    const allPradesh = await db.pradesh.findAll({
      where: pradeshWhereConditions,
      attributes: [
        "pradesh_id",
        "pradesh_eng_name",
        "pradesh_guj_name",
        "pradesh_old_eng_name",
        "pradesh_new_guj_name",
        "user_ids",
        "status",
        "cdt",
        "udt",
      ],
      order: [["pradesh_eng_name", "ASC"]],
    });

    console.log(`✅ Found ${allPradesh.length} pradesh records`);

    if (allPradesh.length === 0) {
      console.log("ℹ️ No pradesh records found");
      return successResponse(res, {
        msg: "No pradesh records found for the given criteria.",
        filter_criteria: {
          pradesh_id: pradesh_id ? parseInt(pradesh_id) : "all",
          event_id: event_id ? parseInt(event_id) : "all",
        },
        total_pradesh: 0,
        data: [],
      });
    }

    console.log("📋 Step 2: Fetching prasad stock data...");

    // Build where conditions for prasad stock
    let prasadWhereConditions = {
      status: "active",
    };

    if (pradesh_id) {
      prasadWhereConditions.pradesh_id = pradesh_id;
    }

    if (event_id) {
      prasadWhereConditions.event_id = event_id;
      console.log(`🔍 Filtering prasad stock by event_id: ${event_id}`);
    }

    // Get prasad stock data with event details
    const prasadStockRecords = await db.prasadStock.findAll({
      where: prasadWhereConditions,
      include: [
        {
          model: db.event,
          as: "event",
          attributes: [
            "event_id",
            "event_name",
            "event_desc",
            "event_location",
            "event_date",
            "event_max_prasad_date",
            "event_item_last_date",
            "is_prasad_active",
            "status",
          ],
        },
      ],
      order: [
        ["pradesh_id", "ASC"],
        ["event_id", "ASC"],
        ["person_name", "ASC"],
        ["cdt", "DESC"],
      ],
    });

    console.log(`✅ Found ${prasadStockRecords.length} prasad stock records`);

    // Group prasad stock by pradesh_id
    const prasadByPradesh = {};
    let totalBoxQty = 0;
    let totalPacketQty = 0;
    let totalRecordsCount = 0;

    prasadStockRecords.forEach((record) => {
      const pradeshId = record.pradesh_id;

      if (!prasadByPradesh[pradeshId]) {
        prasadByPradesh[pradeshId] = [];
      }

      const boxQty = parseFloat(record.prasad_box_qty) || 0;
      const packetQty = parseFloat(record.prasad_packet_qty) || 0;

      totalBoxQty += boxQty;
      totalPacketQty += packetQty;
      totalRecordsCount++;

      prasadByPradesh[pradeshId].push({
        event_details: record.event
          ? {
              event_id: record.event.event_id,
              event_name: record.event.event_name,
              event_desc: record.event.event_desc,
              event_location: record.event.event_location,
              event_date: record.event.event_date,
              event_max_prasad_date: record.event.event_max_prasad_date,
              event_item_last_date: record.event.event_item_last_date,
              is_prasad_active: record.event.is_prasad_active,
              status: record.event.status,
            }
          : null,
        prasad_id: record.id,
        prasad_box_qty: record.prasad_box_qty,
        prasad_packet_qty: record.prasad_packet_qty,
        deliver_box_qty: record.deliver_box_qty,
        deliver_packet_qty: record.deliver_packet_qty,
        person_mobile: record.person_mobile,
        person_name: record.person_name,
        status: record.status,
        cdt: record.cdt,
        udt: record.udt,
      });
    });

    console.log("📋 Step 3: Building pradesh-wise data with 0 defaults...");

    // Build response with all pradesh (including those with 0 data)
    const pradeshWiseData = allPradesh.map((pradesh) => {
      const pradeshId = pradesh.pradesh_id;
      const prasadRecords = prasadByPradesh[pradeshId] || []; // Empty array if no data

      // Calculate totals for this pradesh
      let pradeshBoxQty = 0;
      let pradeshPacketQty = 0;

      prasadRecords.forEach((record) => {
        pradeshBoxQty += parseFloat(record.prasad_box_qty) || 0;
        pradeshPacketQty += parseFloat(record.prasad_packet_qty) || 0;
      });

      return {
        pradesh_details: {
          pradesh_id: pradesh.pradesh_id,
          pradesh_eng_name: pradesh.pradesh_eng_name,
          pradesh_guj_name: pradesh.pradesh_guj_name,
          pradesh_old_eng_name: pradesh.pradesh_old_eng_name,
          pradesh_new_guj_name: pradesh.pradesh_new_guj_name,
          user_ids: pradesh.user_ids,
          status: pradesh.status,
          cdt: pradesh.cdt,
          udt: pradesh.udt,
        },
        prasad_records: prasadRecords, // Will be empty array [] if no data
        pradesh_totals: {
          total_box_qty: parseFloat(pradeshBoxQty.toFixed(2)),
          total_packet_qty: parseFloat(pradeshPacketQty.toFixed(2)),
          total_records: prasadRecords.length,
        },
      };
    });

    const pradeshWithData = pradeshWiseData.filter(
      (p) => p.prasad_records.length > 0
    ).length;
    const pradeshWithoutData = pradeshWiseData.filter(
      (p) => p.prasad_records.length === 0
    ).length;

    console.log(
      `✅ Processed ${allPradesh.length} pradesh: ${pradeshWithData} with data, ${pradeshWithoutData} with zero data`
    );

    // Prepare response
    const responseData = {
      msg: "Prasad stock data retrieved successfully for all pradesh (including zero data).",
      filter_criteria: {
        pradesh_id: pradesh_id ? parseInt(pradesh_id) : "all",
        event_id: event_id ? parseInt(event_id) : "all",
      },
      overall_summary: {
        total_pradesh_count: allPradesh.length,
        pradesh_with_data: pradeshWithData,
        pradesh_with_zero_data: pradeshWithoutData,
        total_prasad_records: totalRecordsCount,
        total_prasad_box_qty: parseFloat(totalBoxQty.toFixed(2)),
        total_prasad_packet_qty: parseFloat(totalPacketQty.toFixed(2)),
      },
      pradesh_wise_data: pradeshWiseData,
    };

    console.log(
      "📤 Sending success response with all pradesh data (including zeros)"
    );
    successResponse(res, responseData);
  } catch (error) {
    console.error("❌ ERROR in getPrasadStock:", {
      name: error.name,
      message: error.message,
      stack: error.stack,
    });

    errorResponse(res, `Failed to fetch prasad stock data: ${error.message}`);
  }
};

export const upsertPrasadStock = async (req, res) => {
  const transaction = await db.sequelize.transaction();

  try {
    console.log("=== UPSERT PRASAD STOCK API ===");
    console.log("Request body:", req.body);

    const {
      event_id,
      pradesh_id,
      prasad_box_qty,
      deliver_box_qty,
      deliver_packet_qty,
      prasad_packet_qty,
      person_mobile,
      person_name,
      user_id,
      status,
    } = req.body;

    // Validate required fields
    if (!event_id || !pradesh_id) {
      await transaction.rollback();
      console.log("❌ Validation failed: event_id and pradesh_id are required");
      return errorResponse(res, "event_id and pradesh_id are required.");
    }

    if (!prasad_packet_qty) {
      await transaction.rollback();
      console.log("❌ Validation failed: prasad_packet_qty is required");
      return errorResponse(res, "prasad_packet_qty is required.");
    }

    console.log(
      `✅ Parameters: event_id=${event_id}, pradesh_id=${pradesh_id}`
    );

    // Check if pradesh exists
    const pradesh = await db.pradesh.findByPk(pradesh_id, { transaction });
    if (!pradesh) {
      await transaction.rollback();
      console.log("❌ Pradesh not found");
      return errorResponse(res, "Pradesh not found.");
    }

    // Check if event exists
    const event = await db.event.findByPk(event_id, { transaction });
    if (!event) {
      await transaction.rollback();
      console.log("❌ Event not found");
      return errorResponse(res, "Event not found.");
    }

    console.log(
      `✅ Pradesh: ${pradesh.pradesh_eng_name}, Event: ${event.event_name}`
    );

    // Check if record already exists
    console.log("🔍 Checking for existing record...");
    const existingRecord = await db.prasadStock.findOne({
      where: {
        event_id: event_id,
        pradesh_id: pradesh_id,
      },
      transaction,
    });

    const prasadData = {
      event_id: parseInt(event_id),
      pradesh_id: parseInt(pradesh_id),
      prasad_box_qty: prasad_box_qty || null,
      deliver_box_qty: deliver_box_qty || null,
      deliver_packet_qty: deliver_packet_qty || null,
      prasad_packet_qty: parseFloat(prasad_packet_qty),
      person_mobile: person_mobile || null,
      person_name: person_name || null,
      user_id: user_id || null,
      status: status || "active",
      udt: new Date(),
    };

    let result;
    let operation;

    if (existingRecord) {
      // Update existing record
      console.log(`🔄 Updating existing record with ID: ${existingRecord.id}`);

      await db.prasadStock.update(prasadData, {
        where: {
          event_id: event_id,
          pradesh_id: pradesh_id,
        },
        transaction,
      });

      result = await db.prasadStock.findOne({
        where: {
          event_id: event_id,
          pradesh_id: pradesh_id,
        },
        transaction,
      });

      operation = "updated";
      console.log(`✅ Record updated successfully`);
    } else {
      // Insert new record
      console.log("➕ Creating new record");

      prasadData.cdt = new Date();

      result = await db.prasadStock.create(prasadData, { transaction });

      operation = "created";
      console.log(`✅ Record created successfully with ID: ${result.id}`);
    }

    // Commit transaction
    await transaction.commit();
    console.log("🎉 Transaction completed successfully!");

    const responseData = {
      msg: `Prasad stock ${operation} successfully.`,
      operation: operation,
      pradesh_details: {
        pradesh_id: pradesh.pradesh_id,
        pradesh_eng_name: pradesh.pradesh_eng_name,
        pradesh_guj_name: pradesh.pradesh_guj_name,
      },
      event_details: {
        event_id: event.event_id,
        event_name: event.event_name,
        event_date: event.event_date,
      },
      prasad_stock: {
        id: result.id,
        event_id: result.event_id,
        pradesh_id: result.pradesh_id,
        prasad_box_qty: result.prasad_box_qty,
        deliver_box_qty: result.deliver_box_qty,
        deliver_packet_qty: result.deliver_packet_qty,
        prasad_packet_qty: result.prasad_packet_qty,
        person_mobile: result.person_mobile,
        person_name: result.person_name,
        user_id: result.user_id,
        status: result.status,
        cdt: result.cdt,
        udt: result.udt,
      },
    };

    console.log("📤 Sending success response");
    successResponse(res, responseData);
  } catch (error) {
    // Rollback transaction on error
    await transaction.rollback();
    console.error("❌ TRANSACTION ROLLED BACK");
    console.error("Error in upsertPrasadStock:", {
      name: error.name,
      message: error.message,
      stack: error.stack,
    });

    errorResponse(res, `Failed to upsert prasad stock: ${error.message}`);
  }
};

