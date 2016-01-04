var DataRetrieverTalk = function (vals) {
	var GLOBAL_title = "Talk:" + vals.title;
	var GLOBAL_featured = vals.featured;
	var GLOBAL_linkToAPI = "http://"+GLOBAL_wikiLanguage+".wikipedia.org/w/api.php?";
	var GLOBAL_JSON = new Object();

	var dataRetriver = {};

	dataRetriver.getJSONString = function () {
		return JSON.stringify(GLOBAL_JSON);
	}

	dataRetriver.getAllMeasures = function () {
	//	console.log("DataRetrieverTalk getAllMeasures");
		GLOBAL_JSON.title = vals.title;
		GLOBAL_JSON.featured = GLOBAL_featured;
        
        GLOBAL_linkToAPI = "http://"+GLOBAL_wikiLanguage+".wikipedia.org/w/api.php?";
		retrieveData(GLOBAL_linkToAPI + "action=parse&format=json&prop=wikitext&section=0&page=" + GLOBAL_title, handleRawTextWithData);

	}

	var retrieveData = function (urlInclAllOptions, functionOnSuccess) {
		$.ajax({
			url : urlInclAllOptions,
			jsonp : "callback",
			dataType : "jsonp",
			cache : false,
			success : functionOnSuccess,
		});
	}

	var handleRawTextWithData = function (JSONResponse) {
		//	console.log("DataRetrieverTalk handleRawTextWithData " + JSON.stringify(JSONResponse));
		var text = JSON.parse(JSON.stringify(JSONResponse));
		if (text.hasOwnProperty("parse")) {
			var extractPlainText = text.parse.wikitext['*'];
			//console.log("PLAIN TEXT: " + extractPlainText);
			if (extractPlainText != undefined) {
				createARating(extractPlainText);
			} else {
				var rating = {};
				rating.type = "none";
				rating.class = "1";
				rating.name = "not rated yet";
				rating.description = "";
				GLOBAL_JSON.rating = rating;
			}
		} else {
			var rating = {};
			rating.type = "none";
			rating.class = "1";
			rating.name = "not rated yet";
			rating.description = "";
			GLOBAL_JSON.rating = rating;
		}
	}

	var createARating = function (text) {
	//	console.log("DataRetrieverTalk createARating");
		//TOOK FORM METADATA SCRIPT BY User:Pyrospirit/metadata
		var rating = {};
		rating.type = "none";
		rating.class = "1";
		rating.name = "not rated yet";
		rating.description = "";
		rating.color = "#fff";
		standardChecks = [
			[/\|\s*(class|currentstatus)\s*=\s*fa\b/i, "fa", 17, "Featured", "The article has attained featured article status by passing an official review.", "#6699ff" ],
			[/\|\s*(class|currentstatus)\s*=\s*fl\b/i, "fl", 16, "Featured List Status", "The article has attained featured list status.", "#6699ff"],
			[/\|\s*class\s*=\s*a\b/i, "a", 15, "A-Class", "The article is well organized and essentially complete, having been reviewed by impartial reviewers from this WikiProject or elsewhere. Good article status is not a requirement for A-Class.", "#66ffff"],
			[/\|\s*class\s*=\s*b\b/i, "b", 14, "B-Class", "The article is mostly complete and without major problems, but requires some further work to reach good article standards.", "#b2ff66"],
			[/\|\s*class\s*=\s*bplus\b/i, "bplus", 13, "B+", "Detailed, clear and accessible, often with history or images; possible good article", "#66ff66"], //used by WP Math
			[/\|\s*class\s*=\s*c\b/i, "c", 12, "C-Class", "The article is substantial, but is still missing important content or contains much irrelevant material. The article should have some references to reliable sources, but may still have significant problems or require substantial cleanup.", "#ffff66"],
			[/\|\s*class\s*=\s*start/i, "start", 11, "Start-Class", "	An article that is developing, but which is quite incomplete. It might or might not cite adequate reliable sources.", "#ffaa66"],
			[/\|\s*class\s*=\s*stub/i, "stub", 10, "Stub-Class", "A very basic description of the topic. However, all very-bad-quality articles will fall into this category", "#ff6666"],
			/*[/\|\s*class\s*=\s*al\b/i, "al", 9, "A-Class List", "This category contains articles that have been rated as 'AL-Class' by the Military history WikiProject. Articles are automatically placed in this category when the corresponding rating is given; please see the assessment department for more information."], // used by WP Military history & WP Highways
			[/\|\s*class\s*=\s*bl\b/i, "bl", 8, "B-Class List", "This category contains articles that have been rated as 'BL-Class' by the Military history WikiProject. Articles are automatically placed in this category when the corresponding rating is given; please see the assessment department for more information."], // used by WP Military history
			[/\|\s*class\s*=\s*cl\b/i, "cl", 7, "C-Class List", "This category contains articles that have been rated as 'CL-Class' by the Military history WikiProject. Articles are automatically placed in this category when the corresponding rating is given; please see the assessment department for more information."], // used by WP Military history
			[/\|\s*class\s*=\s*list/i, "list", 6, "List-Class", "Meets the criteria of a stand-alone list, which is an article that contains primarily a list, usually consisting of links to articles in a particular subject area."],
			[/\|\s*class\s*=\s*sl\b/i, "sl", 5, "Stub-Class List", "A very basic description of the topic. However, all very-bad-quality articles will fall into this category"], // used by WP Plants
            */
			[/\|\s*class\s*=\s*(dab|disambig)/i, "dab", 4, "Disambiguation", "Disambiguation in Wikipedia is the process of resolving the conflicts that arise when a single term is ambiguous. This is most often when it refers to more than one subject covered by Wikipedia, either as the main topic of an article, or a subtopic covered by an article in addition to the article's main subject. For example, the word 'Mercury' can refer to a chemical element, a planet, a Roman god, and many other things. Disambiguation may also be applied to a title that inherently lacks precision and would be likely to confuse readers if it is not clarified, even it does not presently result in a titling conflict between two or more articles.", "#00fa9a"]
			//[/\|\s*class\s*=\s*cur(rent)?/i, "cur", 3, "Current-Class Article", "A topic where details are subject to change often. The article covers an event or topic that is currently going on, such as a football game or a sports team's season."],
			//[/\|\s*class\s*=\s*future/i, "future", 2, "Future-Class Article", "A topic where details are subject to change often. The article covers a future topic of which no broadcasted version exists so far and all information is subject to change when new information arises from reliable sources. With multiple reliable sources there might be information that contradicts other information in the same or other articles."]
		];

		//evaluate the standard checks
		$.each(standardChecks, function (i, e) {
			if (text.match(e[0])) {
				rating.type = e[1];
				rating.class = e[2];
				rating.name = e[3];
				rating.description = e[4];
				rating.color = e[5];
				return false;
			}
		});
		//and then the nonstandard ones. These override earlier ratings if applicable.
		if (rating === "a" && text.match(/\|\s*class\s*=\s*ga\b|\|\s*currentstatus\s*=\s*(ffa\/)?ga\b/i)) {
			rating.type = "a/ga"; // A-class articles that are also GA's
			rating.class = 15;
			rating.name = "Good";
			rating.description = "The article has attained good article status by passing an official review.";
				rating.color = "#66ff66";
		} else if (text.match(/\|\s*class\s*=\s*ga\b|\|\s*currentstatus\s*=\s*(ffa\/)?ga\b|\{\{\s*ga\s*\|/i) &&
			!text.match(/\|\s*currentstatus\s*=\s*dga\b/i)) {
			rating.type = "ga";
			rating.class = 15;
			rating.name = "Good";
			rating.description = "The article has attained good article status by passing an official review.";
				rating.color = "#66ff66";
		}

		GLOBAL_JSON.rating = rating;

	//	console.log("Rating for " + vals.title + ": " + GLOBAL_JSON.rating.type + " " + GLOBAL_JSON.rating.class);
	}
	return dataRetriver;
}
