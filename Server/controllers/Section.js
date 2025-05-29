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
        const newSection = await Section.create({ name: sectionName });

        // add section to course's courseContent array
        await Course.findByIdAndUpdate(
            CourseId,
            { $push: { courseContent: newSection._id } },
            { new: true }
        );

        return res.status(200).json({
            success: true,
            message: 'Section created and added to course successfully',
            section: newSection
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error',
            error: error.message
        });
    }
}