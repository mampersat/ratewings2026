function handler(event) {
    var request = event.request;
    var host = request.headers.host.value;

    if (host === "ratewings.com") {
        return {
            statusCode: 301,
            statusDescription: "Moved Permanently",
            headers: {
                location: {
                    value: "https://www.ratewings.com"
                }
            }
        };
    }

    return request;
}