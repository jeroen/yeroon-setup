varName <- inputs$varName;
targetType <- inputs$targetType;
dateFormat <- inputs$dateFormat;
if(dateFormat=="") dateFormat <- NULL;

if(targetType == "Numeric"){
	myData[[varName]] <- as.numeric(myData[[varName]]);
}

if(targetType == "Factor"){
	myData[[varName]] <- as.factor(myData[[varName]]);
}

if(targetType == "Date"){
	if(is.null(dateFormat)){
	  dateVariable <- as.Date(as.character(myData[[varName]]));
	} else {
	  dateVariable <- as.Date(as.character(myData[[varName]]), format=dateFormat);
	}

	if(all(is.na(dateVariable))){
	  stop("Conversion to date failed. Please check your format");
	}

	NA1 <- is.na(myData[[varName]]);
	NA2 <- is.na(dateVariable);
	newNA <- (!NA1 & NA2)

	if(any(newNA)){
	  varLength <- length(NA1);
	  newNAlines <- c(1:varLength)[newNA];
	  stop("Conversion failed on lines: ",paste(head(newNAlines),collapse=","));
	}

	myData[[varName]] <- dateVariable;

}

outputs <- inputs;
