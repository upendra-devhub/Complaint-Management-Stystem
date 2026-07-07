const sendResponse = require("../utils/response");
const {
    getCurrentUserProfileService,
    updateCurrentUserProfileService
} = require("../services/user.service");

const getCurrentAdminProfile = async (req, res) => {
    try {
        const profile = await getCurrentUserProfileService(req.user.id);

        sendResponse(
            res,
            200,
            true,
            "Admin profile fetched successfully",
            profile
        );
    } catch (error) {
        sendResponse(
            res,
            error.statusCode || 500,
            false,
            error.message
        );
    }
};

const updateCurrentAdminProfile = async (req, res) => {
    try {
        const profile = await updateCurrentUserProfileService(req.user.id, req.body);

        sendResponse(
            res,
            200,
            true,
            "Admin profile updated successfully",
            profile
        );
    } catch (error) {
        sendResponse(
            res,
            error.statusCode || 400,
            false,
            error.message
        );
    }
};

module.exports = {
    getCurrentAdminProfile,
    updateCurrentAdminProfile
};
