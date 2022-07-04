const AuthorModel = require("../models/authorModel")

const jwt = require("jsonwebtoken")

const valid = function (value) {
   
    if(typeof value ==='undefined'|| value ===null) {return false}
    if (typeof value !== "string" || value.trim().length == 0) { return false }
    return true
}

const validateEmail = (email) => {
    return email.match(/^[a-zA-Z0-9.+_-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,15}$/);
  };

  const createAuthor = async function (req, res) {
    try {
        let author = req.body

        if(Object.keys(author).length == 0) { return res.status(400).send({status:false, msg:"Enter the Author details"})}
        
        if (!author.title) { return res.status(400).send({ status: false, msg: "title is required" }) }

        if (!author.fname) { return res.status(400).send({ status: false, msg: "author first name is required" }) }

        if (!author.lname) { return res.status(400).send({ status: false, msg: "author last name is required" }) }

        if (!author.email) { return res.status(400).send({ status: false, msg: "email is required" }) }

        if (!author.password) { return res.status(400).send({ status: false, msg: "password is required" }) }

        if (!valid(author.title)) { return res.status(400).send({ status: false, msg: "title is invalid" }) }

        if (["Mr", "Mrs", "Miss"].indexOf(author.title)== -1) { return res.status(400).send({ status: false, msg: "title should be Mr,Miss,Mrs" }) }
         
        if (!valid(author.fname)) { return res.status(400).send({ status: false, msg: "author first name is not valid" }) }

        if (!valid(author.lname)) { return res.status(400).send({ status: false, msg: "author last name must is not valid " }) }

        if (!valid(author.password)) { return res.status(400).send({ status: false, msg: "password name is not valid" }) }
        
        if(!validateEmail(author.email)) { return res.status(400).send({status:false, msg:"Enter the valid email"})}
        
        const emailAlreadyExist = await AuthorModel.findOne({email:author.email})

        if(emailAlreadyExist) { return res.status(400).send({status:false, msg:"email already exists"})}
        
        let authorCreated = await AuthorModel.create(author)
        res.status(201).send({ status:true,data: authorCreated })
        }
     catch (err) { return res.status(500).send({ status: false, msg: err.message }) }

}


const authorLogIn = async function (req, res) {
    const body =req.body
    const {email, password} = body

    if(Object.keys(body).length == 0) return res.status(400).send({status: false, msg: "Enter your email and password"})

    if (!email) { return res.status(400).send({ status: false, msg: "email is required" }) }

    if (!password) { return res.status(400).send({ status: false, msg: "password is required" }) }

    let checkData = await AuthorModel.findOne({ email, password});
 
    if (checkData == null) {
        res.status(400).send({ status: false, msg: 'Invalid Credential' });
    }
    else {
        let token = jwt.sign({ userId: checkData._id.toString() }, "functionUp");
        res.setHeader("x-api-key",token);
        // res.setHeader("x-userId",checkData._id)
        res.status(200).send({status:true,data: token})
        
    }
}

module.exports={ createAuthor, authorLogIn}

