function formatISOString(isoString = "") {
    const date = new Date(isoString);

    const formatted = `${date.getDate()} ${date.toLocaleString("en-US", {
        month: "short",
    })} ${date.getFullYear()} at ${date.toLocaleTimeString()}`;

    return formatted;
}

export default formatISOString;
