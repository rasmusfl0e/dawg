var capturer = require("chrome-har-capturer");

capturer
    .run(
        ["https://www.dr.dk"],
        {
            width: 1200,
            height: 675,
            content: true
        }
    )
    .on("done", (url, index) => {
        console.log("done", url);
    })
    .on("load", (url, index) => {
        console.log("load", url);
    })
    .on("fail", (url, err, index) => {
        console.log("fail", err, url);
    })
    .on("har", async (har) => {
        console.log(har);
    });
