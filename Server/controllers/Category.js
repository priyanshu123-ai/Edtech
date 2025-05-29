const Categorys = require("../models/Categorys");

//create Tag ka handler function

exports.createCategory = async (req,res) => {
    try{
        //fetch data
        const {name,description} = req.body;
        //validation 
        if(!name || !description){
            return res.status(400).json({
                success:false,
                message:'All fields are required',
            })
        }
        //create entry in db
        const CategorysDetails = await Categorys.create({
            name:name,
            description:description,
        })
        console.log(CategorysDetails);

        //return response

    }catch(error){
        return res.status(500).json({
            success:false,
            message:error.message,
        })

    }
}


//getAlltags handler function

exports.showCategory = async(req,res) => {
    try{
        const allCategory = await Categorys.find({},{name : true,description:true});
        res.status(200).json({
            success:true,
            message:"Message Successfully",
            allCategory
        })

    }catch(error){
          return res.status(500).json({
            success:false,
            message:error.message,
        })

    }
}