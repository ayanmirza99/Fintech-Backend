import { User } from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const generateAccessAndRefreshTokens = async (user) => {
  try {
    const accessToken = user.generateToken(user._id);
    return { accessToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating access token"
    );
  }
};

export const registerUser = asyncHandler(async (req, res) => {
  const { email, fullName, username, password, role } = req.body;

  // validation - not empty
  if (
    [fullName, email, username, password, role].some(
      (field) => field?.trim() === ""
    )
  ) {
    throw new ApiError(400, "All fields are required");
  }

  // check if user already exists - email or username
  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (existedUser) {
    throw new ApiError(409, "User with this email or username already exists");
  }

  // create user object - in db
  const user = await User.create({
    fullName,
    email,
    username,
    password,
    role
  });

// check if user created in db and remove password from response
const createdUser = await User.findById(user._id).select("-password");
if (!createdUser) {
  throw new ApiError(500, "Something went wrong while registering the user");
}

// return response
return res
  .status(201)
  .json(
    new ApiResponse(
      200,
      createdUser,
      `${user.role === "ADMIN" ? "Admin" : "Developer"
      } registered successfully`
    )
  );
});

export const loginUser = asyncHandler(async (req, res) => {
  // get data from req body
  const { email, username, password } = req.body;

  // login by either username or login -> find the user
  if (!username && !email) {
    throw new ApiError(400, "Username or email is required");
  }

  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  // password check
  const isValidPassword = await user.isPasswordCorrect(password);

  if (!isValidPassword) {
    throw new ApiError(401, "Invalid user credentials");
  }

  // generate refresh and acces token
  const { accessToken } = await generateAccessAndRefreshTokens(user);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        ...(({ password, ...rest }) => rest)(user._doc),
        accessToken,
      },
      "Login succesfull"
    )
  );
});


export const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "User fetched successfully"));
});




// export const getSubscriptionDetails = async (req, res) => {
//   try {
//     const user = await User.findById(req.userId).select('subscription');

//     if (!user) {
//       return res.status(404).json({
//         data: null,
//         msg: 'User not found',
//         error: true,
//       });
//     }

//     return res.status(200).json({
//       data: user.subscription,
//       msg: 'Subscription details fetched successfully',
//       error: false,
//     });
//   } catch (err) {
//     return res.status(500).json({
//       data: null,
//       msg: 'Server error while fetching subscription',
//       error: true,
//     });
//   }
// };



export const createOrUpdateSubscription = async (req, res) => {
  try {
    const { userId, packageName,currentPeriodEnd } = req.body;

    if (!userId || !packageName) {
      return res.status(400).json({
        data: null,
        msg: 'userId and packageName are required',
        error: true,
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        data: null,
        msg: 'User not found',
        error: true,
      });
    }



    user.subscription = {
      packageName,
      status: 'active',
      currentPeriodEnd,
    };

    await user.save();

    return res.status(200).json({
      data: user.subscription,
      msg: 'Subscription updated successfully',
      error: false,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      data: null,
      msg: 'Server error while updating subscription',
      error: true,
    });
  }
};