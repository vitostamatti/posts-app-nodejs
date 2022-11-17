"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_controller_1 = require("../controllers/auth.controller");
const authUser_1 = require("../middlewares/authUser");
const requireUser_1 = require("../middlewares/requireUser");
const validate_1 = require("../middlewares/validate");
const user_schema_1 = require("../schemas/user.schema");
const router = express_1.default.Router();
router.post('/register', (0, validate_1.validate)(user_schema_1.createUserSchema), auth_controller_1.registerUserHandler);
router.post('/login', (0, validate_1.validate)(user_schema_1.loginUserSchema), auth_controller_1.loginHandler);
router.get('/logout', authUser_1.authenticateUser, requireUser_1.requireUser, auth_controller_1.logoutHandler);
router.get('/refresh', auth_controller_1.refreshAccessTokenHandler);
router.get('/verifyemail/:verificationCode', (0, validate_1.validate)(user_schema_1.verifyEmailSchema), auth_controller_1.verifyEmailHandler);
router.post('/testemail', auth_controller_1.testEmailHandler);
exports.default = router;
