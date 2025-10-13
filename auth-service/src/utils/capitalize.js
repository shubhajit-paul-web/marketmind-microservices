// Capitalize a string
function capitalize(value = "") {
    if (typeof value !== "string") return false;

    return value[0]?.toUpperCase() + value?.slice(1)?.toLowerCase();
}

export default capitalize;
