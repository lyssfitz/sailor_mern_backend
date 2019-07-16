const Parser= require("rss-parser");
const axios = require("axios");
const parser = new Parser();
const ArticleModel = require("./../database/models/article_model");
const { extract, extractWithEmbedly } = require("article-parser");

async function RssMedCity() {
    let feed = await parser.parseURL("https://medcitynews.com/feed/");

    feed.items.forEach(async item => {        
        let url = item.link;
        const article = await ArticleBody2(url);
        console.log(article);
        await ArticleModel.create({
            date_posted: item.pubDate,
            metadata: {
                title: item.title,
                author: item.creator,
                source: "Med City",
                url: item.link,
                image: article.image,
                categories: item.categories
            },
            article_body: article.content
        })
        console.log("one article saved")
    })
     return console.log("all articles saved to database");
};

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

// package that extract individual article from url & save as div
// the image is available both inside the div and outside as object key-value pair;
//feed to use this strategy: medcity, healthcareIT, digitalhealthX?
// Problem: have \n at the end of each tag
// We are mainingly use ArticleBody2 function now
function ArticleBody2(url){
    let urlLink = url;
    return extractWithEmbedly(urlLink)
        .then((article) => {
            let articleBody = article.content;
            return articleBody
        })
        .catch((err) => {
        console.log(err);
        });
}




// async function RssHealthCareIT() {
//     let feed = await parser.parseURL("https://www.healthcareitnews.com/most_popular/feed");

//     feed.items.forEach(item => {
//         console.log(item.title);
//         console.log(item.creator);
//         console.log(item.link);
//         console.log(item.pubDate);
//         console.log(item.contentSnippet);
//         console.log(item.categories);
//     })
//      return console.log(feed);

// };

// function IndividualArticle() {
//     axios.get("https://medcitynews.com/2019/07/kroger-partners-with-myriad-genetics-on-genetic-testing-pilot")
//     .then(response => {
//         let feed = parser.parseString(response.data);
//         return console.log(feed);
//     })
//     .catch(error=>{
//         return console.log(error);
//     });
// }

// function getIndividualArticle() {
//     let url = "https://medcitynews.com/2019/07/kroger-partners-with-myriad-genetics-on-genetic-testing-pilot"; // medcity example ->extract

//     // let url = "https://www.healthcareitnews.com/news/apple-watches-ai-help-docs-dictate-austin-regional-saving-2-hours-day"; //healthcare example -> extract

//     // let url = "https://www.digitalhx.com/news/patients-push-for-digital-transformation-in-general-practice/"; // digitalhx example ->extractwithEmbedly



//     //1st format
//     // extract(url).then((article) => {
//     //     console.log(article);
//     // })
//     // .catch((err) => {
//     //     console.log(err);
//     // })

//     //2nd format 
//     // extractWithEmbedly(url).then((article) => {
//     //     console.log(article);
//     //    }).catch((err) => {
//     //     console.log(err);
//     //    });
// }




module.exports = {
    // RssMedCity,
    // RssHealthCareIT
    // IndividualArticle,
    getIndividualArticle

}