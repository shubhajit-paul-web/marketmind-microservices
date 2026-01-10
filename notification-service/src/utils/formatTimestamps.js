function formatTimestamps(timestamp) {
    const date = new Date(timestamp)
        ?.toLocaleString("en-IN", {
            dateStyle: "medium",
            timeStyle: "short",
        })
        ?.replace(",", " at");

    return date;
}

export default formatTimestamps;
