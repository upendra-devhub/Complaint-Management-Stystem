const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");

let ioInstance = null;

function resolveRefId(value) {
    if (!value) {
        return "";
    }

    if (typeof value === "string") {
        return value;
    }

    if (value._id) {
        return String(value._id);
    }

    return String(value);
}

function normalizeComplaint(complaint) {
    return complaint && complaint.toObject ? complaint.toObject() : complaint;
}

function initRealtime(server) {
    ioInstance = new Server(server, {
        cors: {
            origin: "*",
            methods: [
                "GET",
                "POST"
            ]
        }
    });

    ioInstance.use((socket, next) => {
        try {
            const token = socket.handshake.auth && socket.handshake.auth.token;

            if (!token) {
                return next(new Error("Authentication token missing"));
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            socket.data.user = decoded;
            return next();
        } catch (error) {
            return next(new Error("Invalid or expired token"));
        }
    });

    ioInstance.on("connection", (socket) => {
        const user = socket.data.user;

        socket.join(`role:${user.role}`);
        socket.join(`user:${user.id}`);

        if (user.role === "employee") {
            socket.join(`employee:${user.id}`);
        }

        socket.emit("realtime:ready", {
            userId: user.id,
            role: user.role
        });
    });

    return ioInstance;
}

function emitComplaintChanged(action, complaint) {
    if (!ioInstance || !complaint) {
        return;
    }

    const normalizedComplaint = normalizeComplaint(complaint);
    const createdById = resolveRefId(normalizedComplaint.createdBy);
    const assignedToId = resolveRefId(normalizedComplaint.assignedTo);
    const payload = {
        action,
        complaint: normalizedComplaint,
        emittedAt: new Date().toISOString()
    };

    ioInstance.to("role:admin").emit("complaint:changed", payload);

    if (createdById) {
        ioInstance.to(`user:${createdById}`).emit("complaint:changed", payload);
    }

    if (assignedToId) {
        ioInstance.to(`employee:${assignedToId}`).emit("complaint:changed", payload);
    }
}

module.exports = {
    initRealtime,
    emitComplaintChanged
};
