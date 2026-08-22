// Use ES modules and import necessary modules
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import db from "../models/index.js";
import { successResponse, errorResponse } from "../utils/responseHandler.js";

// User Registration Handler
export const registerUser = async (req, res) => {
  try {
    const { username, email, phone, password } = req.body;

    // Hash the password for secure storage
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await db.user.create({
      username,
      email,
      phone,
      password: hashedPassword,
    });

    // Create a privacy entry for the user
    await db.privacy.create({
      uid: user.user_id,
      pid: 0,
    });

    // Generate JWT tokens
    const tokenPayload = { id: user.user_id };
    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    const refreshToken = jwt.sign(
      tokenPayload,
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "7d" }
    );

    successResponse(res, {
      msg: "User registered successfully",
      user,
      token,
      refreshToken,
    });
  } catch (error) {
    console.error(error);
    errorResponse(res, error.message);
  }
};

// User Login Handler - Mobile Number Verification
export const login = async (req, res) => {
  const { user_mobile } = req.body;

  try {
    console.log("=== LOGIN API ===");
    console.log("Mobile number:", user_mobile);

    // Validate mobile number input
    if (!user_mobile) {
      console.log("❌ Validation failed: Mobile number is required");
      return errorResponse(res, "Mobile number is required.", 400);
    }

    // Find user by mobile number
    const user = await db.user.findOne({
      where: {
        user_mobile: user_mobile,
        status: "active", // Only allow active users to login
      },
    });

    if (!user) {
      console.log("❌ User not found or inactive");
      return errorResponse(
        res,
        "Mobile number not found or user is inactive.",
        404
      );
    }

    console.log(`✅ User found: ID=${user.user_id}, Name=${user.user_name}`);

    // Find pradesh where this user is assigned (user_id exists in user_ids field)
    console.log(
      `🔍 Searching for pradesh assignment for user_id: ${user.user_id}`
    );

    const assignedPradesh = await db.pradesh.findOne({
      where: {
        [db.Sequelize.Op.and]: [
          db.sequelize.where(
            db.sequelize.fn("concat", ",", db.sequelize.col("user_ids"), ","),
            {
              [db.Sequelize.Op.like]: `%,${user.user_id},%`,
            }
          ),
        ],
        status: "active",
      },
      attributes: [
        "pradesh_id",
        "pradesh_eng_name",
        "pradesh_guj_name",
        "pradesh_old_eng_name",
        "pradesh_new_guj_name",
        "user_ids",
        "status",
      ],
    });

    let pradeshInfo = null;
    if (assignedPradesh) {
      // Verify that the user_id is actually in the comma-separated list
      // (to avoid partial matches like finding user_id 1 in user_id 11)
      const userIdsList = assignedPradesh.user_ids
        ? assignedPradesh.user_ids.split(",").map((id) => id.trim())
        : [];

      if (userIdsList.includes(user.user_id.toString())) {
        pradeshInfo = {
          pradesh_id: assignedPradesh.pradesh_id,
          pradesh_eng_name: assignedPradesh.pradesh_eng_name,
          pradesh_guj_name: assignedPradesh.pradesh_guj_name,
          pradesh_old_eng_name: assignedPradesh.pradesh_old_eng_name,
          pradesh_new_guj_name: assignedPradesh.pradesh_new_guj_name,
          status: assignedPradesh.status,
        };
        console.log(
          `✅ Pradesh assignment found: ${assignedPradesh.pradesh_eng_name} (ID: ${assignedPradesh.pradesh_id})`
        );
      } else {
        console.log(
          `⚠️ User ID found in pradesh but not as exact match in user_ids list`
        );
      }
    } else {
      console.log(
        `ℹ️ No pradesh assignment found for user_id: ${user.user_id}`
      );
    }

    // Generate JWT tokens
    console.log("🔑 Generating JWT tokens...");
    const token = jwt.sign({ id: user.user_id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    const refreshToken = jwt.sign(
      { id: user.user_id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "7d" }
    );

    // Prepare response data
    const responseData = {
      msg: "Login successful",
      user: {
        user_id: user.user_id,
        user_name: user.user_name,
        user_mobile: user.user_mobile,
        user_type: user.user_type,
        user_role: user.user_role,
        status: user.status,
        cdt: user.cdt,
        udt: user.udt,
      },
      pradesh_assignment: pradeshInfo, // Pradesh details where user is assigned
      token,
      refreshToken,
    };

    console.log("✅ Login successful, sending response");
    successResponse(res, responseData);
  } catch (error) {
    console.error("❌ Login error:", error);
    errorResponse(res, "Internal server error", 500);
  }
};
