import { Schema, model, type Types } from "mongoose";

export interface IComment {
  content: string;
  owner: Types.ObjectId;
  video: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const commentSchema = new Schema<IComment>(
  {
    content: { type: String, required: true, trim: true, maxlength: 2000 },
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
    video: { type: Schema.Types.ObjectId, ref: "Video", required: true },
  },
  { timestamps: true }
);

commentSchema.index({ video: 1, createdAt: -1 });

export const Comment = model<IComment>("Comment", commentSchema);
