const bcrypt = require("bcrypt");
const User = require("../models/User");

function sanitizeUser(user) {
    const safeUser = user.toObject ? user.toObject() : { ...user };
    delete safeUser.password;
    return safeUser;
}

async function getCurrentUserProfileService(userId) {
    const user = await User.findById(userId).populate("department", "name description");

    if (!user) {
        const error = new Error("User not found");
        error.statusCode = 404;
        throw error;
    }

    return sanitizeUser(user);
}

async function updateCurrentUserProfileService(userId, payload) {
    const user = await User.findById(userId);

    if (!user) {
        const error = new Error("User not found");
        error.statusCode = 404;
        throw error;
    }

    const allowedFields = [
        "name",
        "email",
        "phone",
        "address",
        "profileImage"
    ];

    for (const field of allowedFields) {
        if (typeof payload[field] === "string") {
            user[field] = payload[field].trim();
        }
    }

    if (payload.email && payload.email.trim().toLowerCase() !== user.email) {
        const existingUser = await User.findOne({
            email: payload.email.trim().toLowerCase(),
            _id: {
                $ne: userId
            }
        });

        if (existingUser) {
            const error = new Error("Email already exists");
            error.statusCode = 400;
            throw error;
        }

        user.email = payload.email.trim().toLowerCase();
    }

    if (payload.newPassword) {
        if (!payload.currentPassword) {
            const error = new Error("Current password is required to set a new password");
            error.statusCode = 400;
            throw error;
        }

        const isMatch = await bcrypt.compare(payload.currentPassword, user.password);

        if (!isMatch) {
            const error = new Error("Current password is incorrect");
            error.statusCode = 400;
            throw error;
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(payload.newPassword, salt);
    }

    await user.save();

    const updatedUser = await User.findById(userId).populate("department", "name description");
    return sanitizeUser(updatedUser);
}

module.exports = {
    getCurrentUserProfileService,
    updateCurrentUserProfileService
};
