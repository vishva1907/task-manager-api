const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Title is required"],
            trim: true
        },

        description: {
            type: String,
            trim: true
        },

        completed: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

// Pre-save middleware
taskSchema.pre("save", async function () {
    console.log("Saving task:", this.title);
});

const Task = mongoose.model("Task", taskSchema);

module.exports = Task;