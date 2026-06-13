import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    status: {
      type: String,
      enum: ["planning", "active", "on_hold", "completed"],
      default: "planning",
    },
    color: { type: String, default: "#7c3aed" },
    dueDate: { type: String },
  },
  { timestamps: true }
);

// Always return id instead of _id
projectSchema.set("toJSON", {
  virtuals: true,
  transform: (_, obj) => {
    obj.id = obj._id;
    delete obj._id;
    delete obj.__v;
    return obj;
  },
});

export default mongoose.model("Project", projectSchema);
