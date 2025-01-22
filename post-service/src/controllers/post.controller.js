import Post from "../models/post.model.js";
import logger from "../utils/logger.js";
import { validateCreatePost } from "../utils/validation.js";


async function invalidatePostCache(req,input) {
    const cacheKey = `post:${input}`;
    await req.redisClient.del(cacheKey);
    const keys = await req.redisClient.keys('posts:*');
    if(keys.length > 0){
        await req.redisClient.del(keys);
    }
    
}

export const createPost = async (req, res) => {
    logger.info("Creating a new post");
    try {
        const { error } = validateCreatePost(req.body)     
        if (error) {
          logger.warn("Validation error", error.details[0].message);
          return res.status(400).json({
            success: false,
            message: error.details[0].message,
          });
        }
        const {content , mediaIds} = req.body;
        const newPost = new Post({
            user: req.user.userId,
            content,
            mediaIds : mediaIds || []

        });
        await newPost.save();
        await invalidatePostCache(req, newPost._id.toString());
        logger.info('Post created successfully', newPost);
        res.status(201).json({ success: true, message: 'Post created successfully' });
        
    } catch (error) {
        logger.error('Error creating post', error);
        res.status(500).json({ success: false, message: 'Error creating post' });
        
    }
}

export const getAllPost = async (req, res) => {
    logger.info("fetching all post");
    try {
        const  page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const startIndex = (page - 1) * limit;

        const cacheKey = `posts:${page}:${limit}`;
        const cachedPosts= await req.redisClient.get(cacheKey);
        if(cachedPosts){
            logger.info('Posts fetched from cache');
            return res.status(200).json({success: true, posts: JSON.parse(cachedPosts)});
        }
        const posts = await  Post .find().sort({createdAt: -1}).limit(limit).skip(startIndex)
        const totalPosts = await Post.countDocuments();

        const result = {
            posts,
            currentPage: page,
            totalPosts,
            totalPages: Math.ceil(totalPosts / limit),
        };
        //save to redis cache

        await req.redisClient.setex(cacheKey, 300, JSON.stringify(result));
        res.json(result);

        

    } catch (error) {
        logger.error('Error fetching post', error);
        res.status(500).json({ success: false, message: 'Error fetching post' });
        
    }
}

export const getPost = async (req, res) => {
    try {
        const  postId = req.params.id;
        const cachekey = `post:${postId}`;
        const cachedPost = await req.redisClient.get(cachekey);

        if(cachedPost){
            logger.info('Post fetched from cache');
            return res.status(200).json({success: true, post: JSON.parse(cachedPost)});
        }
        const singlePost = await Post.findById(postId);
        if(!singlePost){
            return res.status(404).json({success: false, message: 'Post not found'});
        }
        await req.redisClient.setex(cachekey, 3600, JSON.stringify(singlePost));
        res.status(200).json({success: true, post   : singlePost});

        
    } catch (error) {
        logger.error('Error fetching post', error);
        res.status(500).json({ success: false, message: 'Error fetching post by id' });
        
    }
}

export const deletePost = async (req, res) => {
    try {
        const  post = await Post.findOneAndDelete({
            _id: req.params.id,
            user: req.user.userId,
        })
        if(!post){
            return res.status(404).json({success: false, message: 'Post not found'});
        }
        await invalidatePostCache(req, post._id.toString());
        res.status(200).json({success: true, message: 'Post deleted successfully'});

    } catch (error) {
        logger.error('Error deleting post', error);
        res.status(500).json({ success: false, message: 'Error deleting post' });
        
    }
}