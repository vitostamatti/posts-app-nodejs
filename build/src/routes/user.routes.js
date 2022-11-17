"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_controller_1 = require("../controllers/auth.controller");
const authUser_1 = require("../middlewares/authUser");
const requireUser_1 = require("../middlewares/requireUser");
const router = express_1.default.Router();
router.use(authUser_1.authenticateUser, requireUser_1.requireUser);
router.get('/profile', auth_controller_1.getUserProfileHandler);
exports.default = router;
