import express from "express";
import * as gernal from "../controllers/gernalController.js"; // Import all controller functions

const router = express.Router();

// Define routes
router.post("/insertData", gernal.insertData);
router.post("/updateData", gernal.updateData);
router.post("/getData", gernal.getData);
router.post("/deleteData", gernal.deleteData);
router.post("/getItem", gernal.getItem);
router.post("/getItemStock", gernal.getItemStock);
router.post("/getPradeshItems", gernal.getPradeshItems);
router.post("/createNewEvent", gernal.createNewEvent);
router.post("/getDefaultPradeshItems", gernal.getDefaultPradeshItems);
router.post("/copyDefaultStockToFoodStock", gernal.copyDefaultStockToFoodStock);
router.post("/getFoodStockByPerson", gernal.getFoodStockByPerson);
router.post("/getPrasadStock", gernal.getPrasadStock);
router.post("/upsertPrasadStock", gernal.upsertPrasadStock);

// Export the router function
export default (app) => {
  app.use("/", router);
};
