// Complaint Mongoose schema
const mongoose = require("mongoose");

const { Schema } = mongoose;

const complaintSchema = new Schema(
  {
    complaintId: {
      type: String,
      unique: true,
      required: true,
    },

    title: {
      type: String,
      required: [true, "Complaint title is required"],
      trim: true,
    },

    description: {
      type: String,
      required: [true, "Complaint description is required"],
      trim: true,
    },

    category: {
      type: String,
      required: true,
      enum: [
        "Road",
        "Electricity",
        "Water",
        "Garbage",
        "Drainage",
        "Transport",
        "Healthcare",
        "Others",
      ],
    },

    department: {
      type: Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    status: {
      type: String,
      enum: [
        "Pending",
        "Assigned",
        "In Progress",
        "Resolved",
        "Rejected",
        "Closed",
      ],
      default: "Pending",
    },

    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },

    location: {
      type: String,
      required: true,
      trim: true,
    },

    images:[ {
        type: String,
        default: "",
        }
    ],

    adminRemark: {
      type: String,
      default: "",
      trim: true,
    },

    employeeRemark: {
      type: String,
      default: "",
      trim: true,
    },

    resolvedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Complaint", complaintSchema);