import { Schema, model, type Types } from "mongoose";

export interface ISubscription {
  subscriber: Types.ObjectId;
  channel: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const subscriptionSchema = new Schema<ISubscription>(
  {
    subscriber: { type: Schema.Types.ObjectId, ref: "User", required: true },
    channel: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

subscriptionSchema.index({ subscriber: 1, channel: 1 }, { unique: true });
subscriptionSchema.index({ channel: 1, createdAt: -1 });

export const Subscription = model<ISubscription>("Subscription", subscriptionSchema);
