var MachineLearningArticleRetriever = function (vals) {

	var GLOBAL_linkToAPIRev = "http://" + GLOBAL_wikiLanguage + ".wikipedia.org/w/api.php?";
	var GLOBAL_dataCollector = [];
	var GLOBAL_numElements = 17;
	var GLOBAL_interval;
	var machineLearningArticleRetriever = {};
	//var GLOBLA_getFeaturedArticlesLinkRev = "action=query&format=json&list=categorymembers&cmlimit=50&cmtitle=Category:Featured%20articles&continue";
	//var GLOBLA_getFeaturedArticlesLinkRevContinueRev = "action=query&format=json&list=categorymembers&cmlimit=10&cmtitle=Category:Featured%20articles";

	var retrieveData = function (urlInclAllOptions, functionOnSuccess) {
		$.ajax({
			url : urlInclAllOptions,
			jsonp : "callback",
			dataType : "jsonp",
			cache : false,
			success : functionOnSuccess,
		});
	}

	machineLearningArticleRetriever.generateAllLists = function () {
		//For featured articles
		GLOBAL_linkToAPIRev = "http://" + GLOBAL_wikiLanguage + ".wikipedia.org/w/api.php?";
		for (var i = 0; i < featruedArticlesGroundTruth.length; i++) {

			var dr = new DataRetriever({
					title : featruedArticlesGroundTruth[i].name + "&oldid=" + featruedArticlesGroundTruth[i].oldid,
					numberRev : (GLOBAL_searchCountRev),
					featured : false
				});
			GLOBAL_dataCollector.push(dr);
			dr.getAllMeasures();
		}

		GLOBAL_interval = setInterval(machineLearningArticleRetriever.showAllDataAsList, 1000);
	}

	var doneCounter = 0;
	machineLearningArticleRetriever.showAllDataAsList = function () {
		//CHECK IF WE ARE DONE:
		var done = true;

		var inloop = false;
		var crawledArticles = 0;
		//console.log("---------------NEW ROUND: ");
		for (var i = 0; i < GLOBAL_dataCollector.length; i++) {
			var jsonData = JSON.parse(GLOBAL_dataCollector[i].getJSONString());
	//		console.log("machineLearningArticleRetriever.showAllDataAsList: " + jsonData.title + " " + Object.keys(jsonData).length);
			if (Object.keys(jsonData).length < GLOBAL_numElements) {
				done = false;
			} else {
				crawledArticles += 1;
			}
			inloop = true;
		}
		if (!inloop) {
			done = false;
		}

		//----------------------------------------------------------------------
		if (done) {
			doneCounter++;

			if (doneCounter >= 2) {
				clearInterval(GLOBAL_interval);
				var articles = {
					data : []
				};

				for (var i = 0; i < GLOBAL_dataCollector.length; i++) {
					var jsonData = JSON.parse(GLOBAL_dataCollector[i].getJSONString());

					var temp = {};
					for (var key in jsonData) {
						temp[key] = jsonData[key];
					}
					articles.data.push(
						temp);
					////console.log(JSON.stringify(temp));
				}
		//		console.log(JSON.stringify(articles));
			}
		}
	}

	machineLearningArticleRetriever.calcMax = function () {
		var notNormed = [featruedArticlesGroundTruthNotNormed, featruedArticlesTestNotNormed, goodArticlesGroundTruthNotNormed, goodArticlesTestNotNormed, bArticlesGroundTruthNotNormed, bArticlesTestNotNormed, cArticlesGroundTruthNotNormed, cArticlesTestNotNormed, startArticlesGroundTruthNotNormed, startArticlesTestNotNormed, stubArticlesGroundTruthNotNormed, stubArticlesTestNotNormed];
		var keys = ["articleLength", "internalLinks", "currency", "externalLinks", "numEdits", "numAnonymousUserEdits", "flesch", "kincaid", "articleAge", "numImages", "linksHere", "numRegisteredUserEdits", "numAdminUserEdits", "adminEditShare", "numUniqueEditors", "diversity"];
		var maxValuesToKey = {};
		for (var i = 0; i < keys.length; i++) {
			var max = 0;
			var currentKey = keys[i];
			for (var j = 0; j < notNormed.length; j++) {
				var currentArray = notNormed[j];
				for (var k = 0; k < currentArray.length; k++) {
					var currentObject = JSON.parse(currentArray[k]);
					if (max < currentObject[currentKey]) {
						max = currentObject[currentKey];
					}
				}
			}
			maxValuesToKey[currentKey] = max;
		}
		console.log(JSON.stringify(maxValuesToKey));

	}

	machineLearningArticleRetriever.normData = function () {
		var maxValues = JSON.parse(maxValuesForNormalization);
		var notNormed = [featruedArticlesGroundTruthNotNormed, featruedArticlesTestNotNormed, goodArticlesGroundTruthNotNormed, goodArticlesTestNotNormed, bArticlesGroundTruthNotNormed, bArticlesTestNotNormed, cArticlesGroundTruthNotNormed, cArticlesTestNotNormed, startArticlesGroundTruthNotNormed, startArticlesTestNotNormed, stubArticlesGroundTruthNotNormed, stubArticlesTestNotNormed];
		var keys = ["articleLength", "internalLinks", "currency", "externalLinks", "numEdits", "numAnonymousUserEdits", "flesch", "kincaid", "articleAge", "numImages", "linksHere", "numRegisteredUserEdits", "numAdminUserEdits", "adminEditShare", "numUniqueEditors", "diversity"];

		for (var i = 0; i < keys.length; i++) {
			var currentKey = keys[i];
			for (var j = 0; j < notNormed.length; j++) {
				var currentArray = notNormed[j];
				for (var k = 0; k < currentArray.length; k++) {
					var currentObject = JSON.parse(currentArray[k]);
					currentObject[currentKey] = parseFloat(parseFloat(currentObject[currentKey]) / parseFloat(maxValues[currentKey]));
					currentArray[k] = JSON.stringify(currentObject);
				}
			}
		}

		for (var j = 0; j < notNormed.length; j++) {
			var currentArray = notNormed[j];
		//	console.log(j + ": " + JSON.stringify(currentArray));
		}

	}
	return machineLearningArticleRetriever;

}
