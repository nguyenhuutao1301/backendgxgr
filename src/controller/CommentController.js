import Comment from "../models/CommentModal.js";
class CommentController {
  // [GET] /api/comment/:postid
  getComment = async (req, res) => {
    const postId = req.params.postid;
    try {
      const comment = await Comment.find({ postId }).sort({ date: -1 });
      if (!comment) {
        return res.status(401).json("cann't find comment");
      }
      return res.status(200).json(comment);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  };
  // [POST] /api/comment/:postid
  createComment = async (req, res) => {
    const postId = req.params.postid;
    if (!postId) {
      return res.json("can't take postID blogs");
    }
    const { authorId, authorName, content, parentId } = req.body;
    try {
      const newComment = new Comment({
        postId,
        authorId,
        authorName,
        content,
        parentId,
      });
      await newComment.save();
      return res.json(newComment);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  };
  // [PUT] /api/comment/:id
  changeComment = async (req, res) => {
    const id = req.params.id;
    if (!id) {
      return res.json("can't take id");
    }
    try {
      await Comment.findByIdAndUpdate(id, {
        content: req.body.content,
      });
      res.json({ message: "Cập nhật thành công" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  // [DELETE] /api/comment/:id
  deleteComment = async (req, res) => {
    const id = req.params.id;
    if (!id) {
      return res.json("can't take id");
    }
    try {
      await Comment.findByIdAndDelete(id);
      res.json({ message: "Xóa thành công" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
}
export default new CommentController();
