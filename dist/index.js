"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Japanizer = exports.Romanizer = void 0;
var romanizer_1 = require("./features/romanizer");
Object.defineProperty(exports, "Romanizer", { enumerable: true, get: function () { return __importDefault(romanizer_1).default; } });
var japanizer_1 = require("./features/japanizer");
Object.defineProperty(exports, "Japanizer", { enumerable: true, get: function () { return __importDefault(japanizer_1).default; } });
