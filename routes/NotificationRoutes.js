const express = require("express");
const router = express.Router();
const UserNotification = require("../services/UserNotifications");

router.post("/all-users-notif", UserNotification.sendNotificationAllUsers);
router.get("/bday-notif", UserNotification.findBirthdayUsersAndNotify);

module.exports = router;
