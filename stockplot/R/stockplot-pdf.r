	library(RMySQL);
	library(ggplot2);

	plotGraph <- function(market,symbol,graphType,timeFrame,plotLine=T,plotSmooth=T,plotCurrent=T){
	   
		#internal function to get current stock value and time
		getCurrent <- function(symbol){
		
			getUrl <- paste('http://download.finance.yahoo.com/d/quotes.csv?s=',symbol,'&f=sl1d1t1n&e=.csv',sep="");
			myData <- read.csv(getUrl,header=F);
			names(myData) <- c("Symbol","Value","Date","Time","Name");
			return(myData);
		}
		
		printSmooth <- function(){   
		
			if(plotLine & plotSmooth) {
			  myPlot <- qplot(Date,Close,data=myData,geom=c('line','smooth'),main=title,xlab="",ylab="Closing Value");
			} else if(plotLine & !plotSmooth){
			  myPlot <- qplot(Date,Close,data=myData,geom=c('line'),main=title,xlab="",ylab="Closing Value");   
			} else if(!plotLine & plotSmooth){
			  myPlot <- qplot(Date,Close,data=myData,geom=c('smooth'),main=title,xlab="",ylab="Closing Value"); 
			} else if(!plotLine & !plotSmooth){
			  myPlot <- qplot(Date,Close,data=myData,main=title,xlab="",ylab="Closing Value");
			}
			
			ytx <- round(seq(floor(min(na.omit(myData$Close))),ceiling(max(na.omit(myData$Close))), length = 10))
			yloglabels <- seq(floor(min(myData$Close)),ceiling(max(myData$Close)),length=10);
			
			if(plotCurrent){
			  xrange <- range(myData$Date);
			  yrange <- range(myData$Close);    
			  print(myPlot 
					+ geom_hline(yintercept=currentValue$Value,colour="red",linetype=2,size=0.8,alpha=1) 
					+ annotate("text",xrange[1]+abs((xrange[1]-xrange[2])[[1]])/20,currentValue$Value+abs(yrange[1]-yrange[2])/35,label=paste("$",currentValue$Value),colour="red",size=4) 
					+ geom_text(aes(x, y, label = paste(currentValue$Date, currentValue$Time)), data = data.frame(x = range(myData$Date)[2], y = range(myData$Close)[2]), hjust = 1, vjust = 1, size = 4)
				  # + annotate("text",xrange[1]+abs((xrange[1]-xrange[2])[[1]])/20,yrange[2],label=paste(currentValue$Date," ",currentValue$Time),size=4)
				  # + scale_y_log10("share price", breaks =  ytx, labels = ytx)

			  );
			} else {
			  print(myPlot);
			}
		}   
		
		printHighLow <- function() {
		  
			if(plotCurrent){
				xrange <- range(myData$Date);
				yrange <- range(myData$Close);       
				myPlot <- ggplot(data=myData, aes(Date,Close,ymin=Low, ymax=High));
				print(
				  myPlot + geom_linerange()+ ylab("High/Low Value") + xlab("") + opts(title = title)
				  # + geom_text(aes(x, y, label = paste(currentValue$Date, currentValue$Time)), data = data.frame(x = range(myData$Date)[2], y = range(c(myData$High,myData$Low))[2]), hjust = 1, vjust = 1, size = 4)
				  + geom_hline(yintercept=currentValue$Value,colour="red",linetype=2,size=0.8,alpha=1)
				  + annotate("text",xrange[1]+abs((xrange[1]-xrange[2])[[1]])/20,currentValue$Value+abs(yrange[1]-yrange[2])/35,label=paste("$",currentValue$Value),colour="red",size=4)
				); 
			} else {
	   
				myPlot <- ggplot(data=myData, aes(Date,Close,ymin=Low, ymax=High));
				print(
				  myPlot + geom_linerange()+ ylab("High/Low Value") + xlab("") + opts(title = title)
				);         
			}

		}     
		
		con <- dbConnect(MySQL(),user="stockplot", password="stockpass", dbname="stockplot", host="localhost");

		########## prevent SQL injections: ###############
		symbol <- gsub("[^a-zA-Z1-9.-]","",symbol);
		##################################################		
		
		switch(timeFrame, 
		  "1" = query1 <- paste("select DISTINCT * from HISTORY WHERE SYMBOL = '",symbol,"' AND DATE_SUB(CURDATE(),INTERVAL 1 MONTH) <= Date;",sep=""),
		  "2" = query1 <- paste("select DISTINCT * from HISTORY WHERE SYMBOL = '",symbol,"' AND DATE_SUB(CURDATE(),INTERVAL 3 MONTH) <= Date;",sep=""),    
		  "3" = query1 <- paste("select DISTINCT * from HISTORY WHERE SYMBOL = '",symbol,"' AND DATE_SUB(CURDATE(),INTERVAL 6 MONTH) <= Date;",sep=""),
		  "4" = query1 <- paste("select DISTINCT * from HISTORY WHERE SYMBOL = '",symbol,"' AND DATE_SUB(CURDATE(),INTERVAL 1 YEAR) <= Date;",sep=""),
		  "5" = query1 <- paste("select DISTINCT * from HISTORY WHERE SYMBOL = '",symbol,"' AND DATE_SUB(CURDATE(),INTERVAL 5 YEAR) <= Date;",sep="")
		);
			 
		myData <- dbGetQuery(con,query1);
		if(nrow(myData)==0) {stop(paste("MySQL returned no data! Maybe stock was removed from the market. (",query1,")")) }
		myData$Date <- as.Date(myData$Date);
		
		currentValue <- getCurrent(symbol);
		title <- paste(currentValue$Name," (",currentValue$Symbol,")",sep=""); 

		switch(graphType, 
		  "S" = { printSmooth() },
		  "H" = { printHighLow() }    
		); 
		dbDisconnect(con);
	} 
	
	plotRequest <- inputs$plotRequest;
	market <- plotRequest$market;
	company <- plotRequest$company;
	graphType <- plotRequest$graphType;
	timeFrame <- plotRequest$timeFrame;

	pdf(file="plot.pdf", width = 16, height = 12, paper = "a4r", title = company);
	plotGraph(market,company,graphType,timeFrame);
	dev.off();