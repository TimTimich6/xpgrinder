"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTime = void 0;
const getTime = () => {
    const date = new Date();
    const dateStr = date.toTimeString();
    const time = "<" + dateStr.slice(0, 8) + ">";
    return time;
};
exports.getTime = getTime;
// console.log(getTime());
