import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const generateAccessAndRefreshTokens = async (user) => {
  try {
    const accessToken = user.generateToken(user._id);
    return { accessToken };
  } catch (error) {
    throw {
      statusCode: 500,
      message: "Something went wrong while generating access token",
    };
  }
};

export const registerUser = asyncHandler(async (req, res) => {
  const { email, fullName, username, password, role } = req.body;

  if (
    [fullName, email, username, password, role].some(
      (field) => field?.trim() === ""
    )
  ) {
    return res.status(400).json({
      status: 400,
      success: false,
      message: "All fields are required",
      data: null,
    });
  }

  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (existedUser) {
    return res.status(409).json({
      status: 409,
      success: false,
      message: "User with this email or username already exists",
      data: null,
    });
  }

  const user = await User.create({
    fullName,
    email,
    username,
    password,
    role,
  });

  const createdUser = await User.findById(user._id).select("-password");
  if (!createdUser) {
    return res.status(500).json({
      status: 500,
      success: false,
      message: "Something went wrong while registering the user",
      data: null,
    });
  }

  return res.status(201).json({
    status: 201,
    success: true,
    message: `${
      user.role === "ADMIN" ? "Admin" : "Developer"
    } registered successfully`,
    data: createdUser,
  });
});

export const loginUser = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;

  if (!username && !email) {
    return res.status(400).json({
      status: 400,
      success: false,
      message: "Username or email is required",
      data: null,
    });
  }

  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) {
    return res.status(404).json({
      status: 404,
      success: false,
      message: "User does not exist",
      data: null,
    });
  }

  const isValidPassword = await user.isPasswordCorrect(password);

  if (!isValidPassword) {
    return res.status(401).json({
      status: 401,
      success: false,
      message: "Invalid user credentials",
      data: null,
    });
  }

  const { accessToken } = await generateAccessAndRefreshTokens(user);

  // Remove password from user object
  const { password: _, ...userWithoutPassword } = user._doc;

  return res.status(200).json({
    status: 200,
    success: true,
    message: "Login successful",
    data: {
      user: userWithoutPassword,
      accessToken,
    },
  });
});

export const getCurrentUser = asyncHandler(async (req, res) => {
  return res.status(200).json({
    status: 200,
    success: true,
    message: "User fetched successfully",
    data: req.user,
  });
});

export const createOrUpdateSubscription = asyncHandler(async (req, res) => {
  try {
    const { userId, packageName, currentPeriodEnd } = req.body;

    if (!userId || !packageName) {
      return res.status(400).json({
        status: 400,
        success: false,
        message: "userId and packageName are required",
        data: null,
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        status: 404,
        success: false,
        message: "User not found",
        data: null,
      });
    }

    user.subscription = {
      packageName,
      status: "active",
      currentPeriodEnd,
    };

    await user.save();

    return res.status(200).json({
      status: 200,
      success: true,
      message: "Subscription updated successfully",
      data: user.subscription,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      status: 500,
      success: false,
      message: "Server error while updating subscription",
      data: null,
    });
  }
});
