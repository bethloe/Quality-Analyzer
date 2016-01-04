
var GLOBAL_linkToAPI = "http://"+GLOBAL_wikiLanguage+".wikipedia.org/w/api.php?";
var GLOBAL_keyWord = "";
var GLOBAL_maxNumSearch = 0;
var GLOBAL_searchCount = 0;
var GLOBAL_dataCollector = [];
var GLOBAL_dataCollectorTalk = [];
var GLOBAL_CrawledArticles = {};
var GLOBAL_numElements = 17;
var GLOBAL_interval;
var GLOBAL_generatingDataCnt = 0;
var visController;
var GLOBLA_getFeaturedArticlesLink = "action=query&format=json&list=categorymembers&cmlimit=50&cmtitle=Category:Featured%20articles&continue"
	var GLOBLA_getFeaturedArticlesLinkContinue = "action=query&format=json&list=categorymembers&cmlimit=10&cmtitle=Category:Featured%20articles"

	var retrieveData = function (urlInclAllOptions, functionOnSuccess) {
	$.ajax({
		url : urlInclAllOptions,
		jsonp : "callback",
		dataType : "jsonp",
		cache : false,
		success : functionOnSuccess,
	});
}

var getVisController = function () {
	return visController;
}

var setDataToVisController = function () {
	GLOBAL_logger.log("get back for revision history");
	GLOBAL_showRevisions = false;
	visController.setBackColors();
	visController.init(articles);
	visController.hidePreparingMessage();
	$(".backButton").css("display", "none");
}

var searchArticle = function (keyword, maxNumSearch, equationEditor) {
	GLOBAL_logger.log("search Article: " + $("#article-name").val() + " number: " + parseInt($("#max-num").val()));
	GLOBAL_keyWord = $("#article-name").val(); //keyword;
	GLOBAL_maxNumSearch = parseInt($("#max-num").val()); //maxNumSearch;
	GLOBAL_searchCount = 0;
	GLOBAL_dataCollector = [];
	GLOBAL_dataCollectorTalk = [];
	GLOBAL_CrawledArticles = {};
    
    GLOBAL_linkToAPI = "http://"+GLOBAL_wikiLanguage+".wikipedia.org/w/api.php?";
  //  console.log("THE API LINK: " + GLOBAL_linkToAPI);
	retrieveData(GLOBAL_linkToAPI + "action=query&list=search&format=json&srsearch=" + GLOBAL_keyWord + "&srlimit=max&srprop=&continue", handleSearch);
	//retrieveData(GLOBAL_linkToAPI + GLOBLA_getFeaturedArticlesLink, handleSearchFeaturedArticles);

	//showAllData();
	/*window.setInterval(function () {
	//console.log("IN HERE");
	showAllDataTest();
	}, 2000);*/
	GLOBAL_interval = setInterval(showAllDataAsList, 1000);

	visController = new VisController();
	visController.showPreparingMessage("Generating Data.");
	equationEditor.setVisController(visController);
	GLOBAL_generatingDataCnt += 1;
}

var handleSearchFeaturedArticles = function (JSONResponse) {
	var articles = JSON.parse(JSON.stringify(JSONResponse));
	var JSONArticleTitles = articles.query.categorymembers;

	for (var i = 0; i < JSONArticleTitles.length; i++) {
		if (GLOBAL_searchCount >= GLOBAL_maxNumSearch) {
			return;
		}
		if (!GLOBAL_CrawledArticles.hasOwnProperty(JSONArticleTitles[i].title)) {
			GLOBAL_CrawledArticles[JSONArticleTitles[i].title] = 1;
			var dr = new DataRetriever({
					title : JSONArticleTitles[i].title,
					featured : true
				});
			GLOBAL_dataCollector.push(dr);
			dr.getAllMeasures();
			GLOBAL_searchCount += 1;
		}
	}
	if (articles.hasOwnProperty("continue")) {
		if (articles.continue.hasOwnProperty("cmcontinue")) {
			//GET REST OF THE DATA:
			//retrieveData(GLOBAL_linkToAPI + GLOBLA_getFeaturedArticlesLinkContinue  + "&cmcontinue="+articles.continue.cmcontinue+"&continue", //handleSearchFeaturedArticles);

			retrieveData(GLOBAL_linkToAPI + "action=query&list=search&format=json&srsearch=" + GLOBAL_keyWord + "&srlimit=10&srprop=&continue", handleSearch);
		}
	} else {
		//console.log("SEARCH IS DONE");
	}
}
/*
var handleSearch = function (JSONResponse) {
if (!GLOBAL_CrawledArticles.hasOwnProperty("Peter_Parker:_Spider-Man&oldid=443358314")) {
GLOBAL_CrawledArticles["Peter_Parker:_Spider-Man&oldid=443358314"] = 1;
var dr = new DataRetriever({
title : "Peter_Parker:_Spider-Man&oldid=443358314",
featured : false
});
GLOBAL_dataCollector.push(dr);
dr.getAllMeasures();
GLOBAL_searchCount += 1;
}
}*/

var handleSearch = function (JSONResponse) {
	var articles = JSON.parse(JSON.stringify(JSONResponse));
	var JSONArticleTitles = articles.query.search;

	for (var i = 0; i < JSONArticleTitles.length; i++) {
		if (GLOBAL_searchCount >= GLOBAL_maxNumSearch) {
			return;
		}
		if (!GLOBAL_CrawledArticles.hasOwnProperty(JSONArticleTitles[i].title)) {
			GLOBAL_CrawledArticles[JSONArticleTitles[i].title] = 1;
			var dr = new DataRetriever({
					title : JSONArticleTitles[i].title,
					featured : false
				});
			var drTalk = new DataRetrieverTalk({
					title : JSONArticleTitles[i].title,
					featured : false
				});
			GLOBAL_dataCollector.push(dr);
			GLOBAL_dataCollectorTalk.push(drTalk);
			dr.getAllMeasures();
			drTalk.getAllMeasures();
			GLOBAL_searchCount += 1;
		}
	}
	if (articles.hasOwnProperty("continue")) {
		if (articles.continue.hasOwnProperty("sroffset")) {
			//GET REST OF THE DATA:
			retrieveData(GLOBAL_linkToAPI + "action=query&list=search&format=json&srsearch=" + GLOBAL_keyWord + "&srlimit=max&rsoffset=" + articles.continue.sroffset + "&srprop=&continue", handleSearch);
		}
	} else {
		//console.log("SEARCH IS DONE");
	}
}
var doneCounter = 0;
var articles = {
	data : []
};

function SortByClass(a, b) {
	var aScore = a.class;
	var bScore = b.class;
	return ((aScore > bScore) ? -1 : ((aScore < bScore) ? 1 : 0));
}

var showAllDataAsList = function () {
	//CHECK IF WE ARE DONE:
	var done = true;
	articles = {
		data : []
	};

	var inloop = false;
	var crawledArticles = 0;
	for (var i = 0; i < GLOBAL_dataCollector.length; i++) {
		var jsonData = JSON.parse(GLOBAL_dataCollector[i].getJSONString());
		if (Object.keys(jsonData).length < GLOBAL_numElements)
			done = false;
		else {
			crawledArticles += 1;
		}
		inloop = true;
	}
	if (!inloop) {
		done = false;
	}

	if (GLOBAL_generatingDataCnt == 0) {
		visController.updateHeaderInfoSection("Generating Data.");
		visController.updatePreparingMessage(crawledArticles + "/" + GLOBAL_maxNumSearch + " Generating Data.");
		GLOBAL_generatingDataCnt += 1;
	} else if (GLOBAL_generatingDataCnt == 1) {
		visController.updateHeaderInfoSection("Generating Data..");
		visController.updatePreparingMessage(crawledArticles + "/" + GLOBAL_maxNumSearch + " Generating Data..");
		GLOBAL_generatingDataCnt += 1;
	} else if (GLOBAL_generatingDataCnt == 2) {
		visController.updateHeaderInfoSection("Generating Data...");
		visController.updatePreparingMessage(crawledArticles + "/" + GLOBAL_maxNumSearch + " Generating Data...");
		GLOBAL_generatingDataCnt = 0;
	}

	//----------------------------------------------------------------------
	if (done) {
		//console.log("DONE!");
		doneCounter++;

		if (doneCounter >= 2) {
			clearInterval(GLOBAL_interval);
			visController.updateHeaderInfoSection("Generation done!");

			for (var i = 0; i < GLOBAL_dataCollector.length; i++) {
				var jsonData = JSON.parse(GLOBAL_dataCollector[i].getJSONString());
				//Calculation of the QMs.

				var authority = 0.2 * jsonData.numUniqueEditors + 0.2 * jsonData.numEdits + 0.1 * /*Connectivity*/
					1 + 0.3 * /*Num. of Reverts*/
					1 + 0.2 * jsonData.externalLinks + 0.1 * jsonData.numRegisteredUserEdits + 0.2 * jsonData.numAnonymousUserEdits;
				jsonData.Authority = authority;
				var completeness = 0.4 * /*Num. Internal Broken Links*/
					1 + 0.4 * jsonData.internalLinks + 0.2 * jsonData.articleLength;
				jsonData.Completeness = completeness;
				var complexity = 0.5 * jsonData.flesch - 0.5 * jsonData.kincaid;
				jsonData.Complexity = complexity;
				var informativeness = 0.6 * /*InfoNoise*/
					 - 0.6 * jsonData.diversity + 0.3 * jsonData.numImages;
				jsonData.Informativeness = informativeness;
				var consistency = 0.6 * jsonData.adminEditShare + 0.5 * jsonData.articleAge;
				jsonData.Consistency = consistency;
				var currency = jsonData.currency;
				jsonData.Currency = currency;
				var volatility = /*Median Revert Time*/
					1;
				jsonData.Volatility = volatility;

				var temp = {};
				for (var key in jsonData) {
					temp[key] = jsonData[key];
				}
				articles.data.push(
					temp);
				////console.log(JSON.stringify(temp));
			}
			var arrayArticleRatingByWikipedians = [];
			for (var i = 0; i < GLOBAL_dataCollectorTalk.length; i++) {
				var jsonData = JSON.parse(GLOBAL_dataCollectorTalk[i].getJSONString());
				//console.log("HERE:" + JSON.stringify(jsonData));
				var articleRatingByWikipedians = {};
				articleRatingByWikipedians.title = jsonData.title;
				if (jsonData.hasOwnProperty("rating")) {
					articleRatingByWikipedians.class = jsonData.rating.class;
					articleRatingByWikipedians.type = jsonData.rating.type;
					articleRatingByWikipedians.name = jsonData.rating.name;
					articleRatingByWikipedians.description = jsonData.rating.description;
					articleRatingByWikipedians.color = jsonData.rating.color;
				} else {
					articleRatingByWikipedians.class = 1;
					articleRatingByWikipedians.type = "none";
					articleRatingByWikipedians.name = "not rated yet";
					articleRatingByWikipedians.description = "";
					articleRatingByWikipedians.color = "#fff";
				}
				arrayArticleRatingByWikipedians.push(articleRatingByWikipedians);
			}
			//Now we have to sort the arrayArticleRatingByWikipedians
			arrayArticleRatingByWikipedians.sort(SortByClass);

			var rankingByWikipedians = {};
			rankingByWikipedians["raw"] = arrayArticleRatingByWikipedians;

			var arrayArticleRatingByWikipediansMaximumNorm = JSON.parse(JSON.stringify(arrayArticleRatingByWikipedians));
			var arrayArticleRatingByWikipediansEuclideanNorm = JSON.parse(JSON.stringify(arrayArticleRatingByWikipedians));
			var arrayArticleRatingByWikipediansTaxicabNorm = JSON.parse(JSON.stringify(arrayArticleRatingByWikipedians));

			//create maximum norm
			var max = 0;
			for (var i = 0; i < arrayArticleRatingByWikipedians.length; i++) {
				var h = Math.abs(arrayArticleRatingByWikipedians[i].class);
				if (h > max) {
					max = h;
				}
			}

			for (var i = 0; i < arrayArticleRatingByWikipediansMaximumNorm.length; i++) {
				arrayArticleRatingByWikipediansMaximumNorm[i].class = parseFloat(parseFloat(arrayArticleRatingByWikipediansMaximumNorm[i].class) / parseFloat(max));
			}
			rankingByWikipedians["maxNorm"] = arrayArticleRatingByWikipediansMaximumNorm;

			//create taxicab norm
			var sum = 0;
			for (var i = 0; i < arrayArticleRatingByWikipedians.length; i++) {
				sum += Math.abs(arrayArticleRatingByWikipedians[i].class);
			}

			for (var i = 0; i < arrayArticleRatingByWikipediansTaxicabNorm.length; i++) {
				arrayArticleRatingByWikipediansTaxicabNorm[i].class = parseFloat(parseFloat(arrayArticleRatingByWikipediansTaxicabNorm[i].class) / parseFloat(sum));
			}
			rankingByWikipedians["default"] = arrayArticleRatingByWikipediansTaxicabNorm;

			//create euclidean norm
			sum = 0;
			for (var i = 0; i < arrayArticleRatingByWikipedians.length; i++) {
				sum += (Math.abs(arrayArticleRatingByWikipedians[i].class) * Math.abs(arrayArticleRatingByWikipedians[i].class));
			}
			sum = Math.sqrt(sum);
			for (var i = 0; i < arrayArticleRatingByWikipediansEuclideanNorm.length; i++) {
				arrayArticleRatingByWikipediansEuclideanNorm[i].class = parseFloat(parseFloat(arrayArticleRatingByWikipediansEuclideanNorm[i].class) / parseFloat(sum));
			}
			rankingByWikipedians["euclidean"] = arrayArticleRatingByWikipediansEuclideanNorm;

			GLOBAL_showRevisions = false;
			visController.setWikipediansRanking(rankingByWikipedians);
			visController.init(articles);
			visController.hidePreparingMessage();
		}
	}
}

var showAllDataAsTable = function () {
	////console.log("LENGTH: " + GLOBAL_dataCollector.length);
	var done = true;

	for (var i = 0; i < GLOBAL_dataCollector.length; i++) {
		var jsonData = JSON.parse(GLOBAL_dataCollector[i].getJSONString());
		if (Object.keys(jsonData).length < GLOBAL_numElements)
			done = false;
	}
	//----------------------------------------------------------------------
	if (done) {
		$('#output').empty();
		var content = "<table border=\"1\">";
		content += "<tr><th>Article Name</th><th>Total Number of Edits</th><th>Number of Registered User Edits</th><th>Number of Anonymous User Edits</th><th>Number of Admin Edits</th> \
																																																																																							<th>Admin Edit Share</th><th>Number of Unique Editors</th><th>Article length (in # of characters)</th><th>Currency (in days)</th><th>Num. of Internal Links (This value is wrong I guess)</th> \
																																																																																							<th>Num. of External Links</th><th>Num. of Pages which links to this page</th><th>Num. of Images</th><th>Article age (in days)</th><th>Diversity</th> \
																																																																																							<th>Flesch</th><th>Kincaid</th><th>Num. of Internal Broken Links</th><th>Number of Reverts (no permissions)</th><th>Article Median Revert Time (no permissions)</th><th>Article Connectivity (Have problems with that)</th> \
																																																																																							<th>Article Median Revert Time (no permissions)</th><th>Information noise(content) (Have to figure that out)</th>";

		for (var i = 0; i < GLOBAL_dataCollector.length; i++) {
			////console.log(GLOBAL_dataCollector[i].getJSONString());
			var jsonData = JSON.parse(GLOBAL_dataCollector[i].getJSONString());
			content += "<tr><td>" + jsonData.title + "</td><td>" + jsonData.numEdits + "</td><td>" + jsonData.numRegisteredUserEdits + "</td><td>" + jsonData.numAnonymousUserEdits + "</td><td>" + jsonData.numAdminUserEdits + "</td> \
																																																																																																																																						<td>" + jsonData.adminEditShare + "</td><td>" + jsonData.numUniqueEditors + "</td><td>" + jsonData.articleLength + "</td><td>" + jsonData.currency + "</td><td>" + jsonData.internalLinks + "</td> \
																																																																																																																																						<td>" + jsonData.externalLinks + "</td><td>" + jsonData.linksHere + "</td><td>" + jsonData.numImages + "</td><td>" + jsonData.articleAge + "</td><td>" + jsonData.diversity + "</td> \
																																																																																																																																						<td>" + jsonData.flesch + "</td><td>" + jsonData.kincaid + "</td></tr>";

		}
		content += "</table>";

		$('#output').append(content);
	}
}
