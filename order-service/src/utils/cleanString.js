// Removes extra whitespace from strings
function cleanString(value = "") {
    if (typeof value !== "string") return value;
    return value.replace(/\s+/g, " ").trim();
}

export default cleanString;
