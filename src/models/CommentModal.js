import mongoose from "mongoose";
const CommentSchema = new mongoose.Schema({
  postId: { type: mongoose.Schema.Types.ObjectId, ref: "Post", required: true },
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Comment",
    default: null,
  },
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  authorName: { type: String, required: true },
  content: { type: String, required: true },
  date: { type: Date, default: Date.now },
});
const Comment = mongoose.model("Comment", CommentSchema);
export default Comment;
