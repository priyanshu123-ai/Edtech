const Section = require("../models/Section");
const Course = require("../models/Course");

exports.createSection = async (req,res) => {
    try{
        //data fetch
        const {sectionName,CourseId} = req.body;
        //data validation
        if(!sectionName || !CourseId){
            return res.status(400).json({
                success:false,
                message:'Missing Properties',
            })
        }

        //create section
        const newSection = await Section.create({ sectionName });

        // add section to course's courseContent array
        const updateCourseDetails = await Course.findByIdAndUpdate(
            CourseId,
            { $push: { courseContent: newSection._id } },
            { new: true }
        );
        //Use populate  to replace sections/sub-section both in the updatedCourseDetails
        const updatedCourse = await Course.findById(CourseId)
  .populate({
    path: "courseContent",
    populate: {
      path: "subSection"
    }
  });



        return res.status(200).json({
            success: true,
            message: 'Section created and added to course successfully',
           updateCourseDetails
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error',
            error: error.message
        });
    }
}


exports.updateSection = async (req,res) => {
    try{
        //data input
        const {sectionName,sectionId} = req.body;
        //data validation
        if(!sectionName || !sectionId){
            return res.status(400).json({
               success:false,
               message:'Missing Properties'
            })
        }

        //update data
        const section = await Section.findByIdAndUpdate(sectionId,{sectionName},{new:true});
        //return res

        return res.status(200).json({
            success:true,
            message:'Missing Properties'
        })

    }catch(error){
        return res.status(500).json({
            success:false,
            message:"Unable to update Section,please try again",
            error:error.message
        })

    }
}

exports.deleteSection = async (req,res) => {
    try{
        //get ID-assuming that we are sending ID in params
        const {sectionId} = req.params
        //use findByIdandDelete
        await Section.findByIdAndDelete(sectionId);

        //TODO in Testing : do we need to delete the entry from the courseschema
        //return response

        return res.status(200).json({
            success:true,
            message:"Section Deleted Successfully"
        })

    }catch(error){
        return res.status(500).json({
            success:false,
            message:"Unable to delete Section, please try again"
        })

    }
}