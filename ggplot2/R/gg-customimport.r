dataType <- inputs$dataType;
dataHeader <- as.logical(inputs$dataHeader);
dataSep <- inputs$dataSep;
dataDec <- inputs$dataDec;

xlsImport <- function(destination,header){
library(gdata);
return(read.xls(destination,header=header));
}

myData <- switch(dataType,
"csv" = read.csv(filepath, header=dataHeader, sep=dataSep, dec=dataDec),
"csv2" = read.csv2(filepath, header=dataHeader, sep=dataSep, dec=dataDec),
"delim" = read.delim(filepath, header=dataHeader, sep=dataSep, dec=dataDec),
"delim2" = read.delim2(filepath, header=dataHeader, sep=dataSep, dec=dataDec),
"xls" = xlsImport(filepath, header=dataHeader),
stop(paste("invalid dataType: ",dataType))
);

#process return data:
outputs <- list();

guessedList <- list();
guessedList$type <- dataType;
guessedList$header <- dataHeader;
guessedList$dec <- dataDec;
guessedList$sep <- dataSep
outputs$guess <- guessedList;

tryData <- head(myData,10);

#variable names:
outputs$variableNames <- names(tryData);

#TEMP FIX REMOVES DOTS TO PREVENT JAVASCRIPT ISSUES:
outputs$variableNames <- gsub("\\.","_",outputs$variableNames)

#variable data in jsonstore format:
tryMatrix <- as.matrix(tryData);
outputs$variableData <- tryMatrix;