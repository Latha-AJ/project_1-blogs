const BlogModel = require("../models/blogModel")
const AuthorModel = require("../models/authorModel")
const { findOneAndUpdate } = require("../models/blogModel")
const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId


// const moment = require('moment');

const valid = function (value) {
    if (typeof value !== "string" || value.trim().length == 0) { return false }
    if (typeof value ==='undefined' || value === null) {return false}
    return true
}

const isValidObjId = function(objectId){
    return mongoose.Types.ObjectId.isValid(objectId)
}
// ====================================create Blog======================================================================

const createBlog = async function (req, res) {
    try {
        let blogData = req.body

       // checks if the req.body id empty

        if (Object.keys(blogData).length == 0)  return res.status(400).send({ status: false, msg: "Enter the blog details" })

        if (!blogData.title) { return res.status(400).send({ status: false, message: "title is required" }) }

        if (!blogData.body) { return res.status(400).send({ status: false, message: "body is required" }) }

        if (!blogData.authorId) { return res.status(400).send({ status: false, message: "authorid is required" }) }

        if (!blogData.category) { return res.status(400).send({ status: false, message: "category is required" }) }


        if (!valid(blogData.title)) { return res.status(400).send({ status: false, message: "title is not valid" }) }

        if (!valid(blogData.body)) { return res.status(400).send({ status: false, message: "body is not valid" }) }

        if (!valid(blogData.category)) { return res.status(400).send({ status: false, message: "category is not valid" }) }
        
        if(! isValidObjId(blogData.authorId)) {return res.status(400).send({status:false, msg:"Enter the valid author Id"}) }

        if (blogData.tags) {
            for (let i = 0; i < blogData.tags.length; i++) {
                if (!valid(blogData.tags[i])) { return res.status(400).send({ status: false, message: "tags is not valid" }) }

            }
        }
        if (blogData.subcategory) {
            for (let i = 0; i < blogData.subcategory.length; i++) {
                if (!valid(blogData.subcategory[i])) { return res.status(400).send({ status: false, message: "subcategory is not valid" }) }
            }
        }
       
        
      const {title,body,authorId,category, subcategory, isPublished, tags}= blogData

    const blogData1 = {title,body,authorId,category, subcategory, tags,
    isPublished: isPublished? isPublished:false,
    publishedAt:isPublished? new Date():null
    }

        let Id = blogData.authorId

        let author = await AuthorModel.findOne({ _id: Id })

        if (author == null) { { return res.status(400).send({ status: false, message: "author is not persent" }) } }
        let blogCreated = await BlogModel.create(blogData1)
        res.status(201).send({ status: true, data: blogCreated })
    }
    catch (err) { return res.status(500).send({ status: false, msg: err.message }) }
}

// ==============================================get Blog================================================================
const blogList = async function (req, res) {

    try {
        
        const isquery = req.query

        let list = await BlogModel.find({ isDeleted: false, isPublished: true })

        if (!list.length) return res.status(404).send({ status: false, msg: "blog not found" })
          
        if(isquery.authorId)
        {
            if (! isValidObjId(isquery.authorId)){
        
         return  res.status(400).send({status:false, msg:"Enter the valid authorId"})
        }
    }
        let bloglist = await BlogModel.find({$and:[isquery, {isDeleted: false}, {isPublished: true}]})
               
        if (bloglist.length == 0) {

            res.status(404).send({ status: false, msg: "No such Blogs found" })
        }

        else { res.status(200).send({ status: true, data: bloglist }) }

    } catch (err) { return res.status(500).send({ status: false, msg: err.message }) }

}

// ======================================Update Blog===================================================================

const updateBlog = async function (req, res) {
    try {
        
    let blogData = req.body

    let id = req.params.blogId

    if(! isValidObjId(id)) {return res.status(400).send({status:false, msg:"Enter the valid blogId"})}    
    
        if (Object.keys(blogData).length === 0) return res.status(400).send({ status: false, msg: "Enter the data that you want to update" })
        
        const { title,body, tags, subcategory, isPublished} = blogData

        let list1 = await BlogModel.findOne({ _id: id, isDeleted: false })
        if (list1 === null) { return res.status(404).send({ status: false, msg: "blog not found" }) }

        if (blogData.body) {
            if (!valid(blogData.body)) { return res.status(400).send({ status: false, message: "body is not valid" }) }
        }
        if (blogData.title) {
            if (!valid(blogData.title)) { return res.status(400).send({ status: false, message: "title is not valid" }) }
        }
        if (blogData.subcategory) {
            for (let i = 0; i < blogData.subcategory.length; i++) {
                if (!valid(blogData.subcategory[i])) { return res.status(400).send({ status: false, message: "subCategory is not valid" }) }

            }
        }
        if (blogData.tags) {
            for (let i = 0; i < blogData.tags.length; i++) {
                if (!valid(blogData.tags[i])) { return res.status(400).send({ status: false, message: "tags is not valid" }) }

            }
        }
       
        let list = await BlogModel.findOneAndUpdate({ _id: id, isDeleted: false }, { $push: { tags: blogData.tags, subcategory: blogData.subcategory } })

        let finalList = await BlogModel.findOneAndUpdate({ _id: id, isDeleted: false }, { $set:{title:title, body:body, subcategory:subcategory,
        isPublished: isPublished?isPublished:false, publishedAt:isPublished?new Date(): null} }, { new: true })
       
        if (list == null) {
            res.status(404).send({ status: false, msg: "blog not found" })
        }
        else { res.status(200).send({ status: true, data: finalList }) }

    }
    catch (err) { return res.status(500).send({ status: false, msg: err.message }) }

}

// =======================================Deleting blog by ID=============================================================
const deleteBlogById = async function (req, res) {

    try {
        let blogId = req.params.blogId;

        if(! isValidObjId(blogId)) {return res.status(400).send({status:false, msg:"Enter the valid blogId"})} 

        let blog = await BlogModel.findOne({ _id: blogId, isDeleted: false })

        if (blog == null) {
            return res.status(400).send({ msg: 'no such blog exists' });
        }

        let deleteUser = await BlogModel.findOneAndUpdate({ _id: blogId, isDeleted: false }, { $set: { isDeleted: true, deletedAt: new Date() } }, { new: true })

        res.status(200).send({ status: true, data: "deletion succesfull" })
    } catch (err) { return res.status(500).send({ status: false, msg: err.message }) }

}
// ==============================================delete blog by querying=======================================================================
const deleteByQuerying = async function (req, res) {
    try {
        const data = req.query
        const category = req.query.category
        const authorId = req.query.authorId
        const tagName = req.query.tags
        const subcategory = req.query.subcategory
        const isPublished = req.query.isPublished

        //check if the query field is empty
        if (Object.keys(data).length == 0) return res.status(400).send({ status: false, msg: "Enter the details of blog that you would like to delete" })

        //finding document using query params
        const ToBeDeleted = await BlogModel.findOneAndUpdate({ $or: [{ category: category }, { authorId: authorId }, { tags: tagName }, { subcategory: subcategory },{isPublished:isPublished}] }, { $set: { isDeleted: true, deletedAt: new Date() } })

        if (ToBeDeleted == null) return res.status(404).send({ status: false, msg: "Blog not found" })

        res.status(200).send({ status: true, msg: "deletion successfull" })
    }
    catch (err) { return res.status(500).send({ status: false, msg: err.message }) }
}



module.exports = { createBlog, blogList, updateBlog, deleteBlogById, deleteByQuerying }

// module.exports.blogList = blogList
// module.exports.updateBlog = updateBlog
// module.exports.deleteBlogById = deleteBlogById
// module.exports.deleteByQuerying = deleteByQuerying
// $addToSet: { tags: { $each: blogData.tags }, subcategory: { $each: blogData.subCategory } },