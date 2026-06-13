import mongoose from "mongoose";

const memberSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    role: { type: String },
    avatarUrl: { type: String },
  },
  { timestamps: true }
);

memberSchema.set("toJSON", {
  virtuals: true,
  transform: (_, obj) => {
    obj.id = obj._id;
    delete obj._id;
    delete obj.__v;
    return obj;
  },
});

export default mongoose.model("Member", memberSchema);
