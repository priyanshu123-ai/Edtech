const Profile = require("../models/Profile");
const User = require("../models/User");

exports.updateProfile = async (req, res) => {
  try {
    //get data
    const { dateOfBirth = "", about = "", contactNumber, gender } = req.body;

    //get userId

    const id = req.user.id;

    //validation
    if (!contactNumber || !gender || !id) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }
    //find profile

    const userDetails = await User.findById(id);
    const profileId = userDetails.additionalDetails;
    const profileDetails = await Profile.findById(profileId);

    //update profile
    profileDetails.dateOfBirth = dateOfBirth;
    profileDetails.about = about;
    profileDetails.gender = about;
    profileDetails.contactNumber = contactNumber;

    await profileDetails.save();

    //return response
    return res.status(200).json({
      success: true,
      message: "Profile Updated Successfully",
      profileDetails,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};


//delete Account

exports.deleteAccount = async (req,res) => {
    try{

        //get id
        const id = req.user.id;

        //validation

        const userDetails = await User.findById(id);

        if(!userDetails){
            returnvres.status(404).json({
                success:false,
                message:'User not found',
            })
        }

        // delete profile

        await Profile.findByIdAndDelete({_id:userDetails.additionalDetails});
         

         //Todo : HW unerrolvuser from all enrolled courses

         // Unenroll user from all enrolled courses
for (const courseId of userDetails.courses) {
    await Course.findByIdAndUpdate(
        courseId,
        { $pull: { studentsEnrolled: userDetails._id } },
        { new: true }
    );
}

        //delete user
        await User.findByIdAndDelete({_id:id});
       


    }catch(error){
        return res.status(500).json({
            success:false,
            message:'User cannot be deleted successfully'
        })

    }
}

exports.getAllUserDetails = async (req,res) => {
    try{

        //get id
        const id = req.user.id;

        //validation and get user details
        const userDetails = await User.findById(id).populate("additionalDetails").execc();

        //return res
        return res.status(200).json({
            success:true,
            message:"User Data fetched Successfully",

        })

    }catch(error){
        return res.status(500).json({
            success:false,
            message:error.message,
        })

    }
}