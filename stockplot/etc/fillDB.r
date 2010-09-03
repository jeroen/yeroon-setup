library(RMySQL);

fillDB <- function(tableName){

#tableName is string of the table that is to be filled.

  getHistoryStock <- function(symbol){
    getUrl <- paste('http://ichart.finance.yahoo.com/table.csv?s=',symbol,'&a=0&b=1&c=2003&d=1&e=1&f=2020&g=d&ignore=.csv',sep="");
    cat("downloading",getUrl,"\n");
    myData <- read.csv(getUrl,header=T);
    myData$Symbol <- symbol;
    myData$Date <- as.Date(myData$Date);
    myData <- myData[,-7];
    return(myData);
  }
  
  con <- dbConnect(MySQL(),user="stockplot", password="stockpass", dbname="stockplot", host="localhost");

  #GET STOCK LIST:
  query1 <- paste("select DISTINCT symbol from INDICES ORDER BY SYMBOL");
  stocks <- dbGetQuery(con,query1)[[1]];
  
  #CLEAR TABLE:
  #try({
  #  query2 <- paste("TRUNCATE TABLE",tableName);
  #  dbGetQuery(con,query2)
  #});

  for(i in stocks){
    attempt <- try({
      print(Sys.time());
      cat(paste("Trying",i,"\n"));
      myData <- getHistoryStock(i);
      records <- nrow(myData);
      cat(paste("Downloaded",records,"records... "));
      query2 <- paste("DELETE FROM ",tableName," WHERE SYMBOL='",i,"'",sep="");
      dbGetQuery(con,query2);
      cat("Old records deleted...");
      dbWriteTable(con,tableName,myData,append=T,row.names=F);
      cat("New data written to MySQL! \n");
    });
    if(class(attempt)=="try-error"){
      if(names(last.warning)=="cannot open: HTTP status was '404 Not Found'"){
        delquery <- paste("DELETE FROM INDICES WHERE SYMBOL='",i,"'",sep="");
        dbGetQuery(con,delquery);
        warning("stock ", i, " seems 404 and will be removed from DB"); #overwrite last.warning
      } else {
        warning("stock ", i, " had an error but it was not recognized as 404"); #overwrite last.warning
      }
    }
  }
}

fillDB("HISTORY");



