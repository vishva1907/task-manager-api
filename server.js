const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
const cors = require("cors");
const Task = require("./models/Task");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cache = require("./cache");

const User = require("./models/User");
const authMiddleware = require("./middleware/auth");
const validateTask = require("./middleware/validateTask");

const app = express();

app.use(cors());
app.use(express.json());

// Logging Middleware
app.use((req, res, next) => {
    console.log(
        `${req.method} ${req.url} - ${new Date().toISOString()}`
    );
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

// Home Route
app.get("/", (req, res) => {
    res.send("Task Manager API is Running...");
});

// Register Route
app.post("/register", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(409).json({
                message: "User already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            email,
            password: hashedPassword
        });

        res.status(201).json({
            message: "User registered successfully",
            user: {
                id: user._id,
                email: user.email
            }
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Registration failed"
        });
    }
});

// Login Route
app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.json({
            message: "Login successful",
            token
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Login failed"
        });
    }
});

// Get Current User
app.get("/me", authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.status(200).json({
            id: user._id,
            email: user.email,
            createdAt: user.createdAt
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to fetch user"
        });
    }
});

// GET - Fetch All Tasks with Cache
app.get("/tasks", authMiddleware, async (req, res, next) => {
    try {
        const cachedTasks = cache.get("all_tasks");

        if (cachedTasks) {
            cache.recordHit();

            console.log("Cache HIT: all_tasks");

            return res.status(200).json(cachedTasks);
        }

        cache.recordMiss();

        console.log("Cache MISS: all_tasks");

        const tasks = await Task.find();

        cache.set("all_tasks", tasks);

        res.status(200).json(tasks);

    } catch (err) {
        next(err);
    }
});

// GET - Fetch Single Task with Cache
app.get("/tasks/:id", authMiddleware, async (req, res, next) => {
    try {
        const cacheKey = `task_${req.params.id}`;

        const cachedTask = cache.get(cacheKey);

        if (cachedTask) {
            cache.recordHit();

            console.log(`Cache HIT: ${cacheKey}`);

            return res.status(200).json(cachedTask);
        }

        cache.recordMiss();

        console.log(`Cache MISS: ${cacheKey}`);

        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({
                message: "Task not found"
            });
        }

        cache.set(cacheKey, task);

        res.status(200).json(task);

    } catch (err) {
        next(err);
    }
});

// POST - Create New Task
app.post(
    "/tasks",
    authMiddleware,
    validateTask,
    async (req, res, next) => {
        try {
            const newTask = await Task.create({
                title: req.body.title,
                description: req.body.description,
                completed: req.body.completed
            });

            // Invalidate all tasks cache
            cache.del("all_tasks");

            res.status(201).json({
                message: "Task created successfully",
                task: newTask
            });

        } catch (err) {
            next(err);
        }
    }
);

// PUT - Update Task
app.put("/tasks/:id", authMiddleware, async (req, res, next) => {
    try {
        const updatedTask = await Task.findByIdAndUpdate(
            req.params.id,
            {
                title: req.body.title,
                description: req.body.description,
                completed: req.body.completed
            },
            {
                new: true,
                runValidators: true
            }
        );

        if (!updatedTask) {
            return res.status(404).json({
                message: "Task not found"
            });
        }

        // Invalidate caches
        cache.del("all_tasks");
        cache.del(`task_${req.params.id}`);

        res.status(200).json({
            message: "Task updated successfully",
            task: updatedTask
        });

    } catch (err) {
        next(err);
    }
});

// DELETE - Delete Task
app.delete("/tasks/:id", authMiddleware, async (req, res, next) => {
    try {
        const deletedTask = await Task.findByIdAndDelete(
            req.params.id
        );

        if (!deletedTask) {
            return res.status(404).json({
                message: "Task not found"
            });
        }

        // Invalidate caches
        cache.del("all_tasks");
        cache.del(`task_${req.params.id}`);

        res.status(200).json({
            message: "Task deleted successfully",
            task: deletedTask
        });

    } catch (err) {
        next(err);
    }
});

// GET - Cache Statistics
app.get("/cache-stats", authMiddleware, (req, res) => {
    const stats = cache.getStats();

    res.status(200).json({
        message: "Cache statistics",
        hits: stats.hits,
        misses: stats.misses
    });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err);

    // Mongoose Validation Error
    if (err.name === "ValidationError") {
        return res.status(400).json({
            error: "Validation failed",
            details: Object.values(err.errors).map(
                error => error.message
            )
        });
    }

    // Invalid MongoDB ID
    if (err.name === "CastError") {
        return res.status(400).json({
            error: "Invalid task ID"
        });
    }

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

// MongoDB Connection
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB connected");

        const PORT = 5000;

        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error("MongoDB connection failed:", err);
    });