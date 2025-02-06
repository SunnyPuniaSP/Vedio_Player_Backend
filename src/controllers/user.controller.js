import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import {User} from "../models/user.model.js";
import uploadOnCloudinary from "../utils/cloudinary.js";
import ApiResponse from '../utils/ApiResponse.js'
import jwt from "jsonwebtoken";

const generateAccessTokenAndRefreshToken=async(userId)=>{
    try {
        const user=await User.findById(userId)
        const accessToken=user.generateAccessToken();
        const refreshToken=user.generateRefreshToken();
    
        user.refreshToken=refreshToken
        await user.save({validateBeforeSave:false})
    
        return {accessToken,refreshToken};
    } catch (error) {
        throw new ApiError(500,"something went wrong while generating refresh and access tokens")
    }
}

const registerUser=asyncHandler(async(req,res)=>{
    //get user details from frontend
    // validation -not empty
    // check if user already exists
    // check for images, check for avatar
    //upload them to cloudinary
    //create user object -create entry in db
    //remove password and refresh token from response
    //check for user creation
    //return response
    // console.log(req.files);
    console.log(req.body);
    const {fullName,username,email,password}=req.body

    if([fullName,username,email,password].some((field)=>field?.trim()==="")){
        throw new ApiError(400,"Please fill in all fields")
    }

    const existedUser = await User.findOne({
        $or:[{username},{email}]
    })

    if(existedUser){
        throw new ApiError(400,"User already exists")
    }

    const avatarLocalPath=req.files?.avatar?.[0]?.path;
    const coverImageLocalPath=req.files?.coverImage?.[0]?.path;

    if(!avatarLocalPath){
        throw new ApiError(400,"Please upload an avatar")
    }

    const avatar=await uploadOnCloudinary(avatarLocalPath);
    const coverImage=await uploadOnCloudinary(coverImageLocalPath);

    if(!avatar){
        throw new ApiError(500,"Failed to upload avatar")
    }

    const user=await User.create({
        fullName,
        email,
        password,
        avatar:avatar?.url||"",
        coverImage:coverImage?.url || "",
        username:username.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select("-password -refreshToken")

    if(!createdUser){
        throw new ApiError(500,"Failed to create user")
    }

    return res.status(200).json(new ApiResponse(200,createdUser,"user registered successfully"))
    
})

const loginUser=asyncHandler(async(req,res)=>{
    //req body -> data
    //username or email
    //find user
    //check password
    //generate tokens
    //send cookies
    //return response

    const {username,email,password}=req.body

    if(!username && !email){
        throw new ApiError(400,"Please provide username or email")
    }

    const user =await User.findOne({
        $or:[{username},{email}]
    })

    if(!user){
        throw new ApiError(404,"user does not exists")
    }

    const isPasswordValid=user.isPasswordCorrect(password);

    if(!isPasswordValid){
        throw new ApiError(401,"Invalid User Credential")
    }

    const {accessToken,refreshToken}=await generateAccessTokenAndRefreshToken(user._id)

    const loggedInUser=User.findById(user._id).select("-password -refreshToken");

    const options={
        httpOnly:true,
        secure:true
    }

    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        200,
        {
            user:loggedInUser,
            accessToken,
            refreshToken
        },
        "User logged in Successfully"
    )
})

const logoutUser=asyncHandler(async(req,res)=>{
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                refreshToken:undefined
            }
        },
        {
            new:true
        }
    )

    const options={
        httpOnly:true,
        secure:true
    }

    return res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new ApiResponse(200,{},"User Logged Out"))

})

const refreshAccessToken=asyncHandler(async(req,res)=>{
    const incomingRefreshToken=req.cookies?.refreshToken||req.body.refreshToken

    if(!incomingRefreshToken){
        throw new ApiError(401,"unauthorized request")
    }

    const decodedRefreshToken=jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET)

    const user=await User.findById(decodedRefreshToken?._id)

    if(!user){
        throw new ApiError(401,"Invalid Refresh Token")
    }

    if(incomingRefreshToken!==user.refreshToken){
        throw new ApiError(401,"Refresh Token is expired or used")
    }

    const {accessToken,refreshToken}=await generateAccessTokenAndRefreshToken(user._id)

    const options={
        httpOnly:true,
        secure:true
    }

    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
         new ApiResponse(200,{accessToken,refreshToken},"Access token refreshed")
    )

})

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken
}