var MachineLearningMagic = function (vals) {
	var machineLearningMagic = {};
	var method = "threeClasses";
	machineLearningMagic.calculateQMScoreForMachineLearning = function (qmName, rankingModel) {
		//	alert(qmName);
		var allEquations = rankingModel.getEquations();
		var preparedNormalizedData = [featruedArticlesGroundTruthNormalized, featruedArticlesTestNormalized, goodArticlesGroundTruthNormalized, goodArticlesTestNormalized, bArticlesGroundTruthNormalized, bArticlesTestNormalized, cArticlesGroundTruthNormalized, cArticlesTestNormalized, /*startArticlesGroundTruthNormalized, startArticlesTestNormalized,*/
			stubArticlesGroundTruthNormalized, stubArticlesTestNormalized];

		var trainData = [];
		var testData = [];
		var equation = "";
		var origEquation = "";
		for (var j = 0; j < allEquations.length; j++) {
			if (allEquations[j].name == qmName) {
				equation = allEquations[j].equation;
				origEquation = allEquations[j].equation;
				break;
			}
		}
		if (equation == "") {
			alert("ERROR WHILE CALCULATING CLASSIFICATION");
		}
		for (var trainingOrTest = 0; trainingOrTest < 2; trainingOrTest++) {
			for (var j = trainingOrTest; j < preparedNormalizedData.length; j += 2) {
				var currentArray = preparedNormalizedData[j];
				for (var k = 0; k < currentArray.length; k++) {
					equation = origEquation;
					var currentObject = JSON.parse(currentArray[k]);
					for (var key in currentObject) {
						if (currentObject.hasOwnProperty(key)) {
							var re = new RegExp(key, "g");
							equation = equation.replace(re, currentObject[key]);
						}
					}
					var result = math.eval(equation);
					var nObject = {};
					nObject.name = currentObject.title;
					nObject.score = result;
					var theClass = "";
					if (method == "allClasses") {
						if (j == 0 || j == 1)
							theClass = "fa";
						if (j == 2 || j == 3)
							theClass = "ga";
						if (j == 4 || j == 5)
							theClass = "b";
						if (j == 6 || j == 7)
							theClass = "c";
						if (j == 8 || j == 9)
							theClass = "stub";
						//if (j == 10 || j == 11)
						//	theClass = "stub";
					} else {
						if (j == 0 || j == 1)
							theClass = "fa";
						else if (j >= 8)
							theClass = "npfa";
						else
							theClass = "pfa";
					}
					nObject.class = theClass;
					if (trainingOrTest == 0)
						trainData.push(nObject);
					else
						testData.push(nObject);

				}
			}
		}
		//console.log("TrainingsData: " + JSON.stringify(trainData));
		//console.log("TestData: " + JSON.stringify(testData));
		//Now we do the DT classification
		var config = {
			trainingSet : trainData,
			categoryAttr : 'class',
			ignoredAttributes : ['name']
		};

		var decisionTree = new dt.DecisionTree(config);
		var T = 0;
		var F = 0;
		var wholeT = 0;
		var wholeF = 0;
		var currentClass = testData[0].class;
		var oldClass = testData[0].class;
		var classificationScores = [];

		for (var i = 0; i < testData.length; i++) {
			currentClass = testData[i].class;
			if (oldClass != currentClass) {
				var scoreObject = {};
				scoreObject.class = oldClass;
				scoreObject.T = T;
				scoreObject.F = F;
				classificationScores.push(scoreObject);
				T = 0;
				F = 0;
				oldClass = currentClass;
			}
			var testObj = testData[i];
			var decisionTreePrediction = decisionTree.predict(testObj);
			if (testObj.class == decisionTreePrediction) {
				T++;
				wholeT++;
			} else {
				F++;
				wholeF++;
			}
		}

		var scoreObject = {};
		scoreObject.class = oldClass;
		scoreObject.T = T;
		scoreObject.F = F;
		classificationScores.push(scoreObject);
		T = 0;
		F = 0;
		oldClass = currentClass;

		var scoreObjectHelp = {};
		scoreObjectHelp.class = "totalScore";
		scoreObjectHelp.T = wholeT;
		scoreObjectHelp.F = wholeF;
		classificationScores.push(scoreObjectHelp);
		console.log(qmName + " classification scores: " + JSON.stringify(classificationScores));
	}

	machineLearningMagic.classifyArticlesWithDT = function (data) {

		//DT
		var notNormalizedData = [featruedArticlesGroundTruthNotNormed, featruedArticlesTestNotNormed, goodArticlesGroundTruthNotNormed, goodArticlesTestNotNormed, bArticlesGroundTruthNotNormed, bArticlesTestNotNormed, cArticlesGroundTruthNotNormed, cArticlesTestNotNormed, /*startArticlesGroundTruthNotNormed, startArticlesTestNotNormed,*/
			stubArticlesTestNotNormed, stubArticlesGroundTruthNotNormed];

		var trainData = [];
		var testData = [];
		for (var trainingOrTest = 0; trainingOrTest < 2; trainingOrTest++) {
			for (var j = trainingOrTest; j < notNormalizedData.length; j += 2) {
				var currentArray = notNormalizedData[j];
				for (var k = 0; k < currentArray.length; k++) {
					var currentObject = JSON.parse(currentArray[k]);

					var theClass = "";
					if (method == "allClasses") {
						if (j == 0 || j == 1)
							theClass = "fa";
						if (j == 2 || j == 3)
							theClass = "ga";
						if (j == 4 || j == 5)
							theClass = "b";
						if (j == 6 || j == 7)
							theClass = "c";
						if (j == 8 || j == 9)
							theClass = "stub";
						//if (j == 10 || j == 11)
						//	theClass = "stub";
					} else {
						if (j == 0 || j == 1)
							theClass = "FA";
						else if (j >= 8)
							theClass = "NPFA";
						else
							theClass = "PFA";
					}
					currentObject.class = theClass;
					//if (trainingOrTest == 0)
					trainData.push(currentObject);
					//else
					//	testData.push(currentObject);

				}
			}
		}
		//console.log("TrainingsData: " + JSON.stringify(trainData));
		//console.log("TestData: " + JSON.stringify(testData));
		//Now we do the DT classification
		var config = {
			trainingSet : trainData,
			categoryAttr : 'class',
			ignoredAttributes : ['title', 'featured']
		};

		var decisionTree = new dt.DecisionTree(config);
        
	//	console.log("DATA: " + JSON.stringify(data));

		var classificationArray = [];
		for (var i = 0; i < data.length; i++) {
			var currentData = data[i];
			var object = {};
            var outObject = {};
			object.title = currentData.title;
			object.articleLength = currentData.articleLength;
			object.internalLinks = currentData.internalLinks;
			object.currency = currentData.currency;
			object.externalLinks = currentData.externalLinks;
			object.numEdits = currentData.numEdits;
			object.numAnonymousUserEdits = currentData.numAnonymousUserEdits;
			object.flesch = currentData.flesch;
			object.kincaid = currentData.kincaid;
			object.articleAge = currentData.articleAge;
			object.numImages = currentData.numImages;
			object.linksHere = currentData.linksHere;
			object.numRegisteredUserEdits = currentData.numRegisteredUserEdits;
			object.numAdminUserEdits = currentData.numAdminUserEdits;
			object.adminEditShare = currentData.adminEditShare;
			object.numUniqueEditors = currentData.numUniqueEditors;
			object.diversity = currentData.diversity;
            
            var decisionTreePrediction = decisionTree.predict(object);
            outObject.title = currentData.title;
            outObject.class = decisionTreePrediction;
			classificationArray.push(outObject);
		}
        console.log(JSON.stringify(classificationArray));
        return classificationArray;
		/*
		var T = 0;
		var F = 0;
		var wholeT = 0;
		var wholeF = 0;
		var currentClass = testData[0].class;
		var oldClass = testData[0].class;
		var classificationScores = [];

		for (var i = 0; i < testData.length; i++) {
		currentClass = testData[i].class;
		if (oldClass != currentClass) {
		var scoreObject = {};
		scoreObject.class = oldClass;
		scoreObject.T = T;
		scoreObject.F = F;
		classificationScores.push(scoreObject);
		T = 0;
		F = 0;
		oldClass = currentClass;
		}
		var testObj = testData[i];
		var decisionTreePrediction = decisionTree.predict(testObj);
		if (testObj.class == decisionTreePrediction) {
		T++;
		wholeT++;
		} else {
		F++;
		wholeF++;
		}
		}

		var scoreObject = {};
		scoreObject.class = oldClass;
		scoreObject.T = T;
		scoreObject.F = F;
		classificationScores.push(scoreObject);
		T = 0;
		F = 0;
		oldClass = currentClass;

		var scoreObjectHelp = {};
		scoreObjectHelp.class = "totalScore";
		scoreObjectHelp.T = wholeT;
		scoreObjectHelp.F = wholeF;
		classificationScores.push(scoreObjectHelp);
		console.log("measures classification scores: " + JSON.stringify(classificationScores));*/
	}
	return machineLearningMagic;
}
