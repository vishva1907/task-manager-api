const express = require("express");

const app = express();

app.use(express.json());

// Logging Middleware
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url} - ${new Date().toISOString()}`);
    next();
});

// Content-Type Middleware
app.use((req, res, next) => {

    if (
        (req.method === "POST" || req.method === "PUT") &&
        !req.is("application/json")
    ) {
        return res.status(400).json({
            error: "Content-Type must be application/json"
        });
    }

    next();

});

// In-memory Task Storage
let tasks = [
    {
        id: 1,
        title: "Learn Express.js"
    },
    {
        id: 2,
        title: "Complete Practical 4"
    }
];

// Home Route
app.get("/", (req, res) => {
    res.send("Task Manager API is Running...");
});

// GET - Fetch All Tasks
app.get("/tasks", (req, res) => {
    res.status(200).json(tasks);
});

// POST - Create a New Task
app.post("/tasks", (req, res) => {

    const newTask = {
        id: tasks.length + 1,
        title: req.body.title
    };

    tasks.push(newTask);

    res.status(201).json({
        message: "Task created successfully",
        task: newTask
    });

});

// PUT - Update Task
app.put("/tasks/:id", (req, res) => {

    const taskId = parseInt(req.params.id);

    const task = tasks.find(t => t.id === taskId);

    if (!task) {
        return res.status(404).json({
            message: "Task not found"
        });
    }

    task.title = req.body.title;

    res.status(200).json({
        message: "Task updated successfully",
        task: task
    });

});


// DELETE - Remove Task
app.delete("/tasks/:id", (req, res) => {

    const taskId = parseInt(req.params.id);

    const taskIndex = tasks.findIndex(t => t.id === taskId);

    if (taskIndex === -1) {
        return res.status(404).json({
            message: "Task not found"
        });
    }

    const deletedTask = tasks.splice(taskIndex, 1);

    res.status(200).json({
        message: "Task deleted successfully",
        task: deletedTask[0]
    });

});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);

    res.status(500).json({
        error: "Something went wrong"
    });
});

// 404 Route Handler
app.use((req, res) => {
    res.status(404).json({
        error: "Route not found"
    });
});

// Start Server
const PORT = 5000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});