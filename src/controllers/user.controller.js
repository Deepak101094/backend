import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

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

  const avatarLocalPath = req?.files?.avatar[0]?.path;
  const coverImageLocalPath = req?.files.coverImage[0].path;

  console.log(avatarLocalPath);

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(400, "Avatar file is required");
  }

  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    username: username.toLowerCase(),
    email,
    password,
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered Successfully"));
});

export { registerUser };

// const registerUser = async (req, res) => {
//   try {
//     await res.status(200).json({
//       message: "ok",
//     });
//   } catch (error) {
//     console.log("failed");
//   }
// };
