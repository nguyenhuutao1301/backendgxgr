import express from "express";
const router = express.Router();
import checkadmin from "../middleware/checkToken.js";
import PostController from "../controller/PostController.js";
// [GET] /api/post/page (phân trang hoặc lấy tất cả, xử lý trong controller)
router.get("/posts/get-all/page", PostController.getPostsWithPagination); // get posts with pagination (xử lý limit, page trong controller)
// [GET] /api/posts
router.post("/posts/filter/tags", PostController.filterPost); // filter posts
router.get("/posts/find/query", PostController.getPostByQuery); // get posts by query and limit
router.get("/posts/get-all", PostController.getAllPostAndLimit); // get all posts and filter by limit
router.get("/posts/by-id/:id", PostController.getPostById); // get post by id
//[GET] /api/posts/sitemap
router.get("/posts/sitemap", PostController.getPostRenderSiteMap);
// [POST] /api/posts
router.post("/posts", checkadmin.verifyAdmin, PostController.createPosts); //crete new post

// [PUT] /api/posts/:id
router.put("/posts/:id", checkadmin.verifyAdmin, PostController.updatePost); // update post
// [DELETE] /api/posts/:id
router.delete("/posts/:id", checkadmin.verifyAdmin, PostController.deletePost); // delete post
// [GET] /api/posts/:slug
router.get("/posts/:slug(*)", PostController.getPostBySlug); // get post by slug
//[PATCH]
router.patch("/posts/patch/update-like", checkadmin.verifyUser, PostController.patchLikePostById);
export default router;
