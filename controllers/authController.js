const userModel = require("../models/userModel");
const bcrypt=require('bcryptjs')
const jwt=require('jsonwebtoken');
const { token } = require("morgan");
//REGISTER CALL BACK
const registerController=async(req,res)=>{
    try {
        const existingUser=await userModel.findOne({email:req.body.email})
        if(existingUser){
            return res.status(200).send({
                success:false,
                message:'User Already Exist'
            })
        }
        const salt=await bcrypt.genSalt(10)
        const hashPassword=await bcrypt.hash(req.body.password,salt)
        req.body.password=hashPassword

        //rest data
        const user=new userModel(req.body)
        await user.save()
        return res.status(201).send({
            success:true,
            message:'User Registered Successfully',
            user,
        })
    } catch (error) {
        console.log(error)
        res.status(500).send({
            success:false,
            message:'Error in register API',
            error
        })
    }
};

//LOGIN CALL BACK
const loginController=async(req,res)=>{
    try {
        const user=await userModel.findOne({email:req.body.email})
        if(!user){
            return res.status(404).send({
                success:false,
                message:'Invalid Credentials'
            })
        }
        //check role
        if(user.role!==req.body.role){
            return res.status(500).send({
                success:false,
                message:"role doesn't match",
            })
        }
        //Compare Password
        const comparePassword=await bcrypt.compare(req.body.password,user.password)
        if(!comparePassword){
            return res.status(500).send({
                success:false,
                message:'Invalid Credentials'
            })
        }
        const token=jwt.sign({userId:user._id},process.env.JWT_SECRET, {expiresIn:'1d'});
        return res.status(200).send({
            success:true,
            message:'Login Successfully',
            token,
            user
        })
    } catch (error) {
        console.log(error)
        res.status(500).send({
            success:false,
            message:'Error in Login API',
            error
        })
    }
};


//GET CURRENT USER 



const currentUserController = async (req, res) => {
    try {
        const user = await userModel.findById(req.userId).select("-password"); // Exclude password
        if (!user) {
            return res.status(404).send({
                success: false,
                message: "User not found",
            });
        }
        return res.status(200).send({
            success: true,
            message: "User Fetched Successfully",
            user,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).send({
            success: false,
            message: "Unable to get current user",
            error,
        });
    }
};

module.exports={registerController,loginController,currentUserController};