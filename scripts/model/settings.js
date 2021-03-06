function Settings() {

	Settings.prototype.getRankingDimensions = function (domRoot, containerHeight) {

		var margin = {
			top : 0,
			bottom : 20,
			left : 2,
			right : 2
		};
		var width = $(domRoot).width() - margin.left - margin.right;
		var height = containerHeight || '';

		return {
			'margin' : margin,
			'width' : width,
			'height' : height
		};
	};

	/************************************************************
	 * INITDATA
	 *
	 * **/
	Settings.prototype.getRankingInitData = function (rankingModel) {

		var data = fixMissingAndMalformattedValues(rankingModel.getOriginalData());
		var ranking = rankingModel.getRanking();
		var attr = rankingModel.getMode();
		var a = [];
		var i = 0;
		while (i < ranking.length && ranking[i][attr] > 0) {

			a[i] = ranking[i];
			a[i]['title'] = data[a[i].originalIndex]['title'];
			//a[i]['id']          = data[a[i].originalIndex]['id'];
			//a[i]['uri']         = data[a[i].originalIndex]['uri'];
			//a[i]['facets']      = new Array();
			//a[i]['facets']      = data[a[i].originalIndex]['facets'];

			var x0 = 0;
			var maxWeightedScoreFound = false;

			a[i]['weightedKeywords'].forEach(function (wk) {

				if (rankingModel.getMode() === RANKING_MODE.overall_score) {

					wk['x0'] = x0;
					wk['x1'] = x0 + wk['weightedScore'];
					x0 = wk['x1'];
				} else {
					if (wk['weightedScore'] == a[i]['maxScore'] && !maxWeightedScoreFound) {
						wk['x0'] = x0;
						wk['x1'] = x0 + wk['weightedScore'];
						x0 = wk['x1'];
						maxWeightedScoreFound = true;
					} else {
						wk['x0'] = x0;
						wk['x1'] = x0;
					}
				}
			});
			i++;
		}
		return {
			'data' : a
		};
	};

	/************************************************************
	 * INITDATA Wikipedia
	 *
	 * **/
	Settings.prototype.getRankingInitDataWiki = function (rankingByWikipedians, rankingModel) {

		var data = fixMissingAndMalformattedValues(rankingModel.getOriginalData());
		var ranking = rankingModel.getRanking();
		var attr = rankingModel.getMode();

		var a = [];
		var i = 0;
		var myranking = JSON.parse(JSON.stringify(ranking));
		//var myranking = ranking.slice(0);
		while (i < myranking.length && myranking[i][attr] > 0) {
			//a.push.apply(a, myranking[i]);
			//	console.log("heere: " + a.length + " " + i);
			a[i] = myranking[i];
			a[i]['title'] = data[a[i].originalIndex]['title'];
			var x0 = 0;
			var maxWeightedScoreFound = false;
			var valueWiki = 0;
			var type = "";
			var name = "";
			var description = "";
			var color = "#fff";
            var helpRankingByWikipedians;
            if(GLOBAL_selectedNormMethod != "pNorm")
                helpRankingByWikipedians = rankingByWikipedians[GLOBAL_selectedNormMethod];
            else{  
                //FOR P NORM
                helpRankingByWikipedians = rankingByWikipedians["raw"];
                var sum = 0;
                for (var j = 0; j < helpRankingByWikipedians.length; j++) {
                     sum += Math.pow(Math.abs(helpRankingByWikipedians[j].class), GLOBAL_selectedP);
                } 
                sum = Math.pow(sum, (1/GLOBAL_selectedP));
                for (var j = 0; j < helpRankingByWikipedians.length; j++) {
                    helpRankingByWikipedians[j].class = parseFloat(parseFloat(helpRankingByWikipedians[j].class) / parseFloat(sum));
                }
            
            }
		//	console.log("LENGTH: " + helpRankingByWikipedians.length);
			for (var j = 0; j < helpRankingByWikipedians.length; j++) {
				//console.log(helpRankingByWikipedians[j].title + " == " + a[i]['title']);
				if (helpRankingByWikipedians[j].title == a[i]['title']) {
					valueWiki = helpRankingByWikipedians[j].class;
					type = helpRankingByWikipedians[j].type;
					name = helpRankingByWikipedians[j].name;
					description = helpRankingByWikipedians[j].description;
                    color = helpRankingByWikipedians[j].color;
				}
			}
			a[i]['type'] = type;
			a[i]['name'] = name;
			a[i]['description'] = description;
			a[i]['color'] = color;
			if (valueWiki == 0){
				console.log("ERROR Name: " + a[i]['title']);
                }
			a[i]['weightedKeywords'].forEach(function (wk) {
			//	console.log("valueWiki: " + valueWiki);
				if (rankingModel.getMode() === RANKING_MODE.overall_score) {

					wk['x0'] = x0;
					wk['x1'] = x0 + valueWiki;
					x0 = wk['x1'];
				} else {
					if (valueWiki == a[i]['maxScore'] && !maxWeightedScoreFound) {
						wk['x0'] = x0;
						wk['x1'] = x0 + valueWiki;
						x0 = wk['x1'];
						maxWeightedScoreFound = true;
					} else {
						wk['x0'] = x0;
						wk['x1'] = x0;
					}
				}
			});
			i++;
		}
		return a;
	};

	/************************************************************
	 * INITDATA processing
	 *
	 * **/

	function fixMissingAndMalformattedValues(data) {

		var dataArray = [];
		data.forEach(function (d) {
			var obj = {};
			//obj['id'] = d.id;
			obj['title'] = d.title;
			//obj['uri'] = d.uri;
			//obj['facets'] = new Array();
			//obj['facets']['language'] = d.facets.language || 'en';
			//obj['facets']['provider'] = d.facets.provider;
			//obj['facets']['year'] = parseDate(String(d.facets.year));
			//obj['facets']['country'] = d.facets.country || "";
			//obj['keywords'] = d.keywords || [];

			dataArray.push(obj);
		});

		return dataArray;
	}

};
