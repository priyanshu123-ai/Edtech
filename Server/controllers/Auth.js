const User = require("../models/User");
const OTP = require("../models/OTP");
const otpGenerator = require("otp-generator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const mail = require("../utils/mailSender");

//sendOTP

exports.sendOTP = async (req, res) => {
  try {
    //fetch email from request ki body

    const { email } = req.body;

    //check if user already exist

    const checkUserPresent = await User.findOne({ email });

    //if user already exist,then return a response

    if (checkUserPresent) {
      return res.status(401).json({
        success: false,
        message: "User already exist",
      });
    }

    //generate otp

    let otp = otpGenerator(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });
    console.log("OTP generated : ", otp);

    //check unique otp or not
    const result = await OTP.findOne({ otp: otp });

    while (result) {
      otp = otpGenerator(6, {
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false,
      });
      result = await OTP.findOne({ otp: otp });
    }

    const otpPayload = { email, otp };

    //create an entry for OTP

    const otpBody = await OTP.create(otpPayload);
    console.log(otpBody);

    //return response successful
    res.status(200).json({
      success: true,
      message: "OTP Sent Successfully",
      otp,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//signup

exports.signUp = async (req, res) => {
  //data fetch from request ki body

  try {
    const {
      firstName,
      lastName,
      email,
      password,
      conformPassword,
      accountType,
      contactNumber,
      otp,
    } = req.body;

    //validate krlo

    if (
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !conformPassword ||
      !otp
    ) {
      return res.status(403).json({
        success: false,
        message: "All fields are required",
      });
    }

    //2 passwordmatch karlo
    if (password !== conformPassword) {
      return res.status(400).json({
        success: false,
        message:
          "Password and conformPassword value does not match, please try again",
      });
    }

    //check user already exist or not

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User is already registered",
      });
    }

    //find most recent OTP stored for the user
    const recentOtp = await OTP.find({ email })
      .sort({ createdAt: -1 })
      .limit(1);
    console.log(recentOtp);
    //validate OTP

    if (recentOtp.length == 0) {
      //OTP not found
      return res.status(400).json({
        success: false,
        message: "OTP Found",
      });
    } else if (otp !== recentOtp) {
      //Invalid OTP

      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    //Hash password

    const hashedPassword = await bcrypt.hash(password, 10);

    //entry create in DB

    const profileDetails = await Profile.create({
      gender: null,
      dateOfBirth: null,
      about: null,
      contactNumber: null,
    });

    const user = await User.create({
      firstName,
      lastName,
      email,
      contactNumber,
      password: hashedPassword,
      accountType,
      additionalDetails: profileDetails._id,
      image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
    });
    //return res

    return res.status(200).json({
      success: true,
      message: "User is registered Successfully",
      user,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//LOGIN
exports.login = async (req,res) => {
    try{
        //get data from req body
        const {email,password} = req.body;
        //validation data
        if(!email || !password){
            return res.status(403).json({
                success:false,
                message:"All fields are required, please try again",
            })
        }

        //user check exist or not
        const user = await User.findOne({email}).populate("additionalDetails");
        if(!user){
            return res.status(401).json({
                success:false,
                message:"User is not registered,please signup first",

            })
          }
            //generate JWT, after password matching
            if(await bcrypt.compare(password,user.password)){
                const payload = {
                    email:user.email,
                    id:user._id,
                    role:user.role,
                }

                const token = jwt.sign(payload,process.env.JWT_SECRET,{
                  expiresIn:"2h",
                });
                user.token = token;
                user.password=undefined;

                //create cookie and send response
                const options = {
                  expires:new Date(Date.now() + 3*24*60*60*1000),
                  httpOnly:true,
                }

                res.cookie("token",token,options).status(200).json({
                  success:true,
                  token,
                  user,
                  message:"Logged in Successfully",
                })
            }else{
              return res.status(401).json({
                success:false,
                message:"Password is Incorrect",
              })
            }

        


    }catch(error){
      console.log(error);
      return res.status(500).json({
        success:false,

        message:"Login Failure, Please try again",
      })

    }
}

//changePassword

exports.changePassword = async(req,res) => {
 try{
  const {email} = req.user;
  const {password,newPassword,conformPassword} = req.body;
  //validate all fields
  if(!password || !newPassword || !conformPassword){
    return res.status(400).json({
      success:false,
      message:"All fields are required",
    });
  }

  //check new password match
  if(newPassword!==conformPassword){
    return res.status(400).json({
      success:false,
      message:"New Password and Confirm Password do not match",
    });
  }

  //Find user
  const user = await User.findOne({email});
  if(!user){
    return res.status(404).json({
      success:false,
      message:"User not found",
    })
  }

  //check old password
  const isMatch = await bcrypt.compare(password,user.password);
  if(!isMatch){
    return res.status(401).json({
      success:false,
      message:"Old password is incorect",
    })
  }

  //Hash new password and update
  const hashedPassword = await bcrypt.hash(newPassword,10);
  user.password = hashedPassword;
  await user.save();

  //Send mail - password updated

  await mail(
    user.email,
    "Password Changed Successfully",
    "Your password has been updated Successfully"
  )

  //Return response

  return res.status(200).json({
    success:true,
    message:"Password updated Successfully",
  })



 }catch(error){
  console.log(error);
  return res.status(500).json({
    success:false,
    message:"Something went wrong,please try again"
  })

 }
} 
