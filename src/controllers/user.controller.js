import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";

/* 
steps for register :- 

 - get user details from frontend
 - validation - not empty
 - check if user already exists: username, email
 - check for images, check for avatar
 - upload them to cloudinary, avatar
 - create user object - create entry in db
 - remove password and refresh token field from response
 - check for user creation
 - return response

 */
const registerUser = asyncHandler(async (req, res) => {
  const { username, email, password, fullName } = req.body;

  if (
    [username, email, password, fullName].some((field) => {
      return field?.trim === "";
    })
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const existedUser = User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "User with email or password already exists");
  }
});

// const registerUser = async (req, res) => {
//   try {
//     await res.status(200).json({
//       message: "ok",
//     });
//   } catch (error) {
//     console.log("failed");
//   }
// };

export { registerUser };
