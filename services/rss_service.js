const Parser= require("rss-parser");
const parser = new Parser();
const ArticleModel = require("./../database/models/article_model");
const { extract, extractWithEmbedly } = require("article-parser");


//Function to retrieve rss feed from MedCity and save to local database
async function fetchRSS(url) {
    let feed = await parser.parseURL(url);
    feed.items.forEach(async item => {        
        const itemURL = item.link;

        const dhx = "https://www.digitalhx.com/feed/";
        let isDHX = false;
        if (url === dhx) {
            isDHX = true;
            console.log("I am here because DHX is true")
        }

        try {
            const article = await ArticleBody2(itemURL);
            await ArticleModel.create({
                date_posted: item.pubDate,
                metadata: {
                    title: item.title,
                    author: item.creator,
                    source: feed.title,
                    url: item.link,
                    image: isDHX ? item.enclosure.url : article.image,
                    // rssCategories: item.categories,
                    // localCategories: importCategories
                },
                article_body: isDHX ? item['content:encoded'] : article.content
            })
        } catch(error) {
            console.log("***************************  Ignore the error if the error is duplicate keys: E11000  ********************************");
            console.log(`Error: ${error}`);
        }
        isDHX = false;
        console.log("one article saved")
    })
     return console.log("all articles saved to database");
};

//Function 1 to retrieve article body from the article url
    // package that extract individual article from url & save inside <body> as html;
    // the image is available both inside the div and outside as object key-value pair;
    // Problem: have no \n at the end of the each tag, however need to remove html & body tag
function ArticleBody1(url){
    let urlLink = url;
    return extract(urlLink)
        .then((article) => {
            let {image, content} = article;
            let articleBody = {image, content};
            return articleBody
        })
        .catch((err) => {
            console.log(err);
        })
}

//Function 2 to retrieve article body from the article url
    // package that extract individual article from url & save as div
    // the image is available both inside the div and outside as object key-value pair;
    //feed to use this strategy: medcity, healthcareIT, digitalhealthX?
    // Problem: have \n at the end of each tag
    // We are mainingly use ArticleBody2 function now
function ArticleBody2(url){
    let urlLink = url;
    return extractWithEmbedly(urlLink)
        .then((article) => {
            let articleBody = article;
            return articleBody
        })
        .catch((err) => {
        console.log(err);
        });
}

//regex function -> common function for check regex;
function regexHealth(array){
    let health = "";
    for (item of array) {
        if (/health/i.test(item)) {
            health = "health";
            break;
        }
    }
    return health;
}

function regexBio(array){
    let check = [];
    array.forEach( item=> {
       check.push(/bio/.test(item));
    })
    if (check.includes('true')) {
        return 'bio';
    }
}

// function regexGeneral(array,checkItem){
//     let checked = "";
//     for (item of array) {
//         let itemCheck = item.match(checkItem);
//         if (itemCheck[0] !== ""){
//             checked = checkItem;
//             break;
//         }
//     }
//     return checked;
// }


module.exports = {
    fetchRSS
}