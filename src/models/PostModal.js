import mongoose from "mongoose";

const PostSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    authorName: {
      type: String,
      required: true,
      trim: true,
    },
    authorUrl: {
      type: String,
      trim: true,
    },
    publishedDate: {
      type: Date,
      default: Date.now,
    },
    modifiedDate: {
      type: Date,
    },
    image: {
      url: {
        type: String,
        required: true,
      },
      alt: {
        type: String,
      },
    },
    tags: [
      {
        type: String,
      },
    ],
    category: {
      name: {
        type: String,
      },
      url: {
        type: String,
      },
    },
    breadcrumbs: [
      {
        name: {
          type: String,
        },
        url: {
          type: String,
        },
      },
    ],
    comments: [
      {
        author: { type: String },
        content: { type: String },
        date: { type: Date, default: Date.now },
      },
    ],
    likes: [{ type: String, default: "" }],
  },
  {
    timestamps: true,
  }
);

const Post = mongoose.model("Post", PostSchema);

// ✅ Thêm export default
export default Post;
