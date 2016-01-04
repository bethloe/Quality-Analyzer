var Logger = function (vals) {
	var isLogger = false;
	var logger = {};
	var now = new Date();
	var logFileName = now.getTime() / 1000;
	logger.log = function (logMessage) {
		if (isLogger) {
		//	console.log("FILENAME: " + logFileName + GLOBAL_username + " Message: " + logMessage);
			$.post("logger.php", {
				fileName : logFileName + GLOBAL_username,
				logMessage : logMessage
			})
			.done(function (data) {
				//console.log("OUTPUT: " + data);
				//alert(data);
			});
		}
	}

	return logger;

}
