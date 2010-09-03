#required packages: foreign, gdata, xlsx (+rjava)
# to install package xlsx in centos you need java JDK:
# yum install jpackage-utils
# download JDK 6.xx from http://java.sun.com/javase/downloads/widget/jdk6.jsp
# download the rpm.bin file. This is a self extracting archive, so chmod +x, and then ./file.bin
# do a R CMD javareconf
# now you can install.packages('xlsx');

guessData <- function (filepath,filename=NULL){

  makeHeaderFile <- function(filepath){
    #copy the first 10 lines (or less) to tempfile
    tempFile <- tempfile();
    write(scan(filepath, "raw", sep="\n" ,nmax=10, quiet=T),tempFile);
    return(tempFile);
  }

  getFileName <- function(filepath){
      splitted <- strsplit(filepath, "/")[[1]];
      return(splitted[length(splitted)]);
  }

  getExtention <- function(somename){
      splitted <- strsplit(somename, "\\.")[[1]];
      return(splitted[length(splitted)]);
  }

  getHead <- function(filepath){
    #counts the number of hits of a character in lines 2 to 10 of the file
    headerFile <- makeHeaderFile(filepath);
    firstLines <- scan(headerFile,"raw",quiet=T);
    bigString <- paste(firstLines[c(-1)], collapse=" ");
    ndots <- length(gregexpr("\\.",bigString)[[1]]);
    nsemicolon <- length(gregexpr(";",bigString)[[1]]);
    ncomma <- length(gregexpr(",",bigString)[[1]]);
    return(list(dot=ndots,semicolon=nsemicolon,comma=ncomma,headerFile=headerFile));
  }

  readSav <- function(filepath){
    library(foreign);
    myData <- read.spss(filepath, reencode="utf8", to.data.frame=TRUE);
    dataRows <- nrow(myData);
    if(dataRows < 10) { return(list(myData=myData,data=myData[1:dataRows,,drop=F],type="spss")); }
    return(list(myData=myData,data=myData[1:10,,drop=F],type="spss"));
  }

  readDta <- function(filepath){
    library(foreign);
    myData <- read.dta(filepath);
    dataRows <- nrow(myData);
    if(dataRows < 10) { return(list(myData=myData,data=myData[1:dataRows,,drop=F],type="dta")); }
    return(list(myData=myData,data=myData[1:10,,drop=F],type="dta"));
  }

  readRda <- function(filepath, filename){
    load(filepath);
    dfname <- substr(filename,1,nchar(filename)-4);
    if(!exists(dfname)){
      stop(paste("uploaded rda file '",filename,"' did not contain an object '", dfname, "' so I don't know what to look for.",sep=""));
    }
    myData <- as.data.frame(get(dfname)); #removes extension.
    return(list(myData=myData,data=head(myData,10),type="rda"));
  }

  readRdata <- function(filepath, filename){
    load(filepath);
    dfname <- substr(filename,1,nchar(filename)-6);
    if(!exists(dfname)){
      stop(paste("uploaded Rdata file '",filename,"' did not contain an object '", dfname, "' so I don't know what to look for.",sep=""));
    }
    myData <- as.data.frame(get(dfname)); #removes extension.
    return(list(myData=myData,data=head(myData,10),type="rda"));
  }

  readXls <- function(filepath){
    library(gdata);
    myData <- try(read.xls(filepath),T);
    if(class(myData)=="try-error"){
      stop("read.xls (from the package gdata) failed to import your xls file. Please make sure your file contains only data: no figures, graphs, markup, etc. Furthermore try to avoid non-latin characters. If it still fails, open your file in Excel and save it as comma seperated or tab delimited format.");
    }
    dataRows <- nrow(myData);
    if(dataRows < 10) { return(list(myData=myData,data=myData[1:dataRows,,drop=F],type="xls")); }
    return(list(myData=myData,data=myData[1:10,,drop=F],type="xls",header=T));
  }

  readXlsx <- function(filepath){

    stop("MS Excel 2007 (.xlsx) format is not supported for now. Please open your data in Excel, and save it as .xls, .txt or .csv");
    library(xlsx);
    myData <- read.xlsx(filepath, 1);
    dataRows <- nrow(myData);
    if(dataRows < 10) { return(list(myData=myData,data=myData[1:dataRows,,drop=F],type="xls")); }
    return(list(myData=myData,data=myData[1:10,,drop=F],type="xlsx"));
  }

  readCsv <- function(filepath){
    heads <- getHead(filepath);
    headerFile <- heads$headerFile

    if(heads$dot >= heads$semicolon){
       #probably comma seperated type 1
       try({
         tryData1 <- read.csv(headerFile, header=T);
       });
       try({
         tryData2 <- read.csv(headerFile, header=F);
       });

       if(exists("tryData1") && exists("tryData2")){

          if(all(sapply(tryData1,is.numeric) == sapply(tryData2,is.numeric))){
              #Including the header did not make any difference. There is probably no header.
              return(list(data=tryData2,header=F, sep=",", dec=".", type="csv"));

          } else {
              #Including the header did make a difference. There is probably a header.
              return(list(data=tryData1,header=T, sep=",", dec=".", type="csv"));
          }

       } else if(exists("tryData1") && !exists("tryData2")){
              #readinig in without header failed.
              return(list(data=tryData1,header=T, sep=",", dec=".", type="csv"));

       } else if(!exists("tryData1") && exists("tryData2")){
              #reading in with header failed.
              return(list(data=tryData2,header=F, sep=",", dec=".", type="csv"));
       } else {
          stop("Data type could not be determined. Are you sure this is a comma seperated file?");
       }
    } else {
       #probably comma seperated type 1
       try({
         tryData1 <- read.csv2(headerFile, header=T);
       });
       try({
         tryData2 <- read.csv2(headerFile, header=F);
       });

       if(exists("tryData1") && exists("tryData2")){

          if(all(sapply(tryData1,is.numeric) == sapply(tryData2,is.numeric))){
              #Including the header did not make any difference. There is probably no header.
              return(list(data=tryData2,header=F, sep=";", dec=",", type="csv2"));

          } else {
              #Including the header did make a difference. There is probably a header.
              return(list(data=tryData1,header=T, sep=";", dec=",", type="csv2"));
          }

       } else if(exists("tryData1") && !exists("tryData2")){
              #readinig in without header failed.
              return(list(data=tryData1,header=T, sep=";", dec=",", type="csv2"));

       } else if(!exists("tryData1") && exists("tryData2")){
              #reading in with header failed.
              return(list(data=tryData2,header=F, sep=";", dec=",", type="csv2"));
       } else {
          stop("Data type could not be determined. Are you sure this is a comma seperated file?");
       }

    }
  }

  readTab <- function(filepath){
    heads <- getHead(filepath);
    headerFile <- heads$headerFile

    if(heads$dot >= heads$comma){
       #probably delim type 1 (dots for decimal);
       try({
         tryData1 <- read.delim(headerFile, header=T);
       });
       try({
         tryData2 <- read.delim(headerFile, header=F);
       });

       if(exists("tryData1") && exists("tryData2")){

          if(all(sapply(tryData1,is.numeric) == sapply(tryData2,is.numeric))){
              #Including the header did not make any difference. There is probably no header.

              return(list(data=tryData2,header=F, sep="\t", dec=".", type="delim"));

          } else {
              #Including the header did make a difference. There is probably a header.
              return(list(data=tryData1,header=T, sep="\t", dec=".", type="delim"));
          }

       } else if(exists("tryData1") && !exists("tryData2")){
              #readinig in with header failed.
              return(list(data=tryData1,header=T, sep="\t", dec=".", type="delim"));

       } else if(!exists("tryData1") && exists("tryData2")){
              #reading in without header failed.
              return(list(data=tryData2,header=F, sep="\t", dec=".", type="delim"));
       } else {
          stop("Failed to read CSV data. Are you sure data is in comma seperated format?");
       }
    } else {
       #probably delim type 2 (comma for decimal);
       try({
         tryData1 <- read.delim2(headerFile, header=T);
       });
       try({
         tryData2 <- read.delim2(headerFile, header=F);
       });

       if(exists("tryData1") && exists("tryData2")){

          if(all(sapply(tryData1,is.numeric) == sapply(tryData2,is.numeric))){
              #Including the header did not make any difference. There is probably no header.
              return(list(data=tryData2,header=F, sep="\t", dec=",", type="delim2"));

          } else {
              #Including the header did make a difference. There is probably a header.
              return(list(data=tryData1,header=T, sep="\t", dec=",", type="delim2"));
          }

       } else if(exists("tryData1") && !exists("tryData2")){
              #readinig in without header failed.
              return(list(data=tryData1,header=T, sep="\t", dec=",", type="delim2"));

       } else if(!exists("tryData1") && exists("tryData2")){
              #reading in with header failed.
               return(list(data=tryData2,header=F, sep="\t", dec=",", type="delim2"));
       } else {
          stop("Failed to read delimited data. Are you sure data is in tab delimited format?");
       }

    }
  }

  #actual function code

  extention <- getExtention(filename);

  tryData <- switch(extention,
    "sav" = readSav(filepath),
    "rda" = readRda(filepath, filename),
  	"rdata" = readRda(filepath, filename),
    "Rdata" = readRdata(filepath, filename),
    "xls" = readXls(filepath),
    "xlsm" = readXls(filepath),
    "xlsx" = readXlsx(filepath),
    "csv" = readCsv(filepath),
    "dta" = readDta(filepath),
    readTab(filepath),
  );

  return(tryData);
}



filepath <- inputs$filepath;
filename <- inputs$filename;

######################### injection fix: ##########################
filename <- gsub("[?:|*><{};\\/()#\"']","",filename);
###################################################################

#read in the data:
myGuess <- guessData(filepath,filename);

#extra check for maximal number of Variables:
if(ncol(myGuess$data) > 100){
  stop("Your dataset contains more than the maximum of 100 variables.");
}
if(nrow(myGuess$data) > 100000){
  stop("Your dataset contains more than the maximum of 100.000 rows.");
}

outputs <- list();

#variable names:
outputs$variableNames <- names(myGuess$data);

#TEMP FIX REMOVES DOTS TO PREVENT JAVASCRIPT ISSUES:
outputs$variableNames <- gsub("\\.","_",outputs$variableNames)

#variable data in jsonstore format:
guessData <- as.matrix(myGuess$data);
attr(guessData,"dimnames") <- NULL;
outputs$variableData <- guessData;

#guess options:
guessedList <- list();
guessedList$type <- myGuess$type;
guessedList$header <- myGuess$header;
guessedList$dec <- myGuess$dec;
guessedList$sep <- myGuess$sep;
outputs$guess <- guessedList;

#try to import real dataframe:
if(any(myGuess$type==c("csv","csv2","delim","delim2"))){
  myType <- myGuess$type;
  myHeader <- myGuess$header;

  readfun <- get(paste("read",myType,sep="."));
  myData <- try(readfun(filepath, header=myHeader));  #sep en dec are implicit in type
  if(class(myData)=="try-error"){
    outputs$error <- as.character(myData);
  }
} else {
  myData <- myGuess$myData;
}
