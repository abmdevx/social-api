import { Schema, model, type Types } from "mongoose";

export interface ILike {
  comment?: Types.ObjectId;
  video?: Types.ObjectId;
  tweet?: Types.ObjectId;
  likedBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const likeSchema = new Schema<ILike>(
  {
    comment: { type: Schema.Types.ObjectId, ref: "Comment" },
    video: { type: Schema.Types.ObjectId, ref: "Video" },
    tweet: { type: Schema.Types.ObjectId, ref: "Tweet" },
    likedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

// A like targets exactly one thing.
likeSchema.pre("validate", function () {
  const targets = [this.comment, this.video, this.tweet].filter(Boolean).length;
  if (targets !== 1) {
    this.invalidate("video", "A like must reference exactly one of video, comment or tweet");
  }
});

// One like per (target, user). Partial so the absent targets of the other like kinds are ignored.
// Explicit names avoid clashing with the legacy indexes of the same key pattern, whose
// `$ne: null` partial filter MongoDB does not support.
for (const target of ["video", "tweet", "comment"] as const) {
  likeSchema.index(
    { [target]: 1, likedBy: 1 },
    {
      name: `uniq_${target}_likedBy`,
      unique: true,
      partialFilterExpression: { [target]: { $type: "objectId" } },
    }
  );
  // Plain single-field index for "count likes of X" queries (partial indexes are skipped by $in lookups).
  likeSchema.index({ [target]: 1 }, { sparse: true });
}
likeSchema.index({ likedBy: 1, createdAt: -1 });

export const Like = model<ILike>("Like", likeSchema);
