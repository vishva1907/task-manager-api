const taskEvents = require("./events");

taskEvents.on("task-created", async (task) => {
    const startTime = new Date().toISOString();

    console.log(
        `[Notification] Handler started at ${startTime}`
    );

    // Simulate slow background processing
    await new Promise((resolve) => setTimeout(resolve, 2000));

    console.log(
        `[Notification] Task "${task.title}" created at ${new Date().toISOString()}`
    );

    console.log(
        `[Notification] Assigned user: ${task.userId || "Not specified"}`
    );

    console.log(
        `[Notification] Handler completed at ${new Date().toISOString()}`
    );
});

// Task deleted listener
taskEvents.on("task-deleted", (task) => {
    console.log(
        `[Notification] Task "${task.title}" was deleted at ${new Date().toISOString()}`
    );
});

// Error listener
taskEvents.on("error", (error) => {
    console.error(
        `[Event Error] ${error.message}`
    );
});