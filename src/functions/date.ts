import { type RIGHT_NOW_DATE, RIGHT_NOW_DATE_REGEX } from "../types.ts";

/**
 * Gets the current date (at the moment the function is called) and returns it as a `RIGHT_NOW_DATE`.
 *
 * @export
 * @returns {RIGHT_NOW_DATE}
 */
export function GetDateNow(): RIGHT_NOW_DATE {
    const now = new Date();

    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, "0");
    const day = now.getDate().toString().padStart(2, "0");
    const hours = now.getHours().toString().padStart(2, "0");
    const minutes = now.getMinutes().toString().padStart(2, "0");

    const formattedDate: RIGHT_NOW_DATE = `${year}-${month}-${day} ${hours}:${minutes}`;
    return formattedDate;
}

/**
 * Takes a `RIGHT_NOW_DATE` and turns it into a JS `Date()` so code can interact with it.
 *
 * @param {RIGHT_NOW_DATE} date The date string you want to make standard.
 * @returns {Date}
 */
export function MakeRightNowDateStandard(
    date: RIGHT_NOW_DATE,
): Date {
    if (!RIGHT_NOW_DATE_REGEX.test(date)) throw new TypeError("Provided dateString doesn't match RIGHT_NOW_DATE Regular Expression.");

    const [datePart, timePart] = date.split(" ");

    if (!datePart) throw new Error("undefined datePart");
    if (!timePart) throw new Error("undefined timePart");

    const [year, month, day] = datePart.split("-").map(Number);
    const [hours, minutes] = timePart.split(":").map(Number);

    if (!year) throw new Error("undefined year");
    if (!month) throw new Error("undefined month");

    return new Date(year, month - 1, day, hours, minutes);
}
