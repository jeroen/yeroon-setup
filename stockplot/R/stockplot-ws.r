	require(ggplot2);
	require(RMySQL);

	plotGraph <- function(market,symbol,graphType,timeFrame,plotLine=T,plotSmooth=T,plotCurrent=T,vp){
	
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
			if(plotCurrent){
			  xrange <- range(myData$Date);
			  yrange <- range(myData$Close);    
			  print(myPlot +
				  geom_hline(yintercept=currentValue$Value,colour="red",linetype=2,size=0.8,alpha=1) +
				  annotate("text",xrange[1]+abs((xrange[1]-xrange[2])[[1]])/20,currentValue$Value+abs(yrange[1]-yrange[2])/35,label=paste("$",currentValue$Value),colour="red",size=4) #+
				  + geom_text(aes(x, y, label = paste(currentValue$Date, currentValue$Time)), data = data.frame(x = range(myData$Date)[2], y = range(myData$Close)[2]), hjust = 1, vjust = 1, size = 4)
				  #annotate("text",xrange[1]+abs((xrange[1]-xrange[2])[[1]])/20,yrange[2],label=paste(currentValue$Date," ",currentValue$Time),size=4)
				  ,vp=vp
			  );
			} else {
			  print(myPlot,vp=vp);
			}
		}   
		
		printHighLow <- function() {
			if(plotCurrent){
				xrange <- range(myData$Date);
				yrange <- range(myData$Close);       
				myPlot <- ggplot(data=myData, aes(Date,Close,ymin=Low, ymax=High));
				print(
				  myPlot + geom_linerange()+ ylab("High/Low Value") + xlab("") + opts(title = title) +
				  geom_hline(yintercept=currentValue$Value,colour="red",linetype=2,size=0.8,alpha=1) +
				  annotate("text",xrange[1]+abs((xrange[1]-xrange[2])[[1]])/20,currentValue$Value+abs(yrange[1]-yrange[2])/35,label=paste("$",currentValue$Value),colour="red",size=4) #+
				  ,vp=vp
				); 
			} else {
	   
				myPlot <- ggplot(data=myData, aes(Date,Close,ymin=Low, ymax=High));
				print(
				  myPlot + geom_linerange()+ ylab("High/Low Value") + xlab("") + opts(title = title)
				  ,vp=vp
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
		if(nrow(myData)==0) {stop(paste("MySQL returned no data! (",query1,")")) }
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
	numberOfGraphs <- length(plotRequest);  

	pdf("workspace.pdf",width = 32, height = 24, paper = "a4r", title = "stockplot");

	if(numberOfGraphs==1){
		grid.newpage();
		pushViewport(viewport(layout = grid.layout(1, 2)));
		vplayout <- function(x, y){
			viewport(layout.pos.row = x, layout.pos.col = y);
		}
		if(plotRequest[[1]] != "NA") try({ plotGraph(plotRequest[[1]]$market,plotRequest[[1]]$company,plotRequest[[1]]$graphType,plotRequest[[1]]$timeFrame, vp = vplayout(1, 1:2)) });
	}

	if(numberOfGraphs==2){
		grid.newpage();
		pushViewport(viewport(layout = grid.layout(2, 2)));
		vplayout <- function(x, y){
			viewport(layout.pos.row = x, layout.pos.col = y);
		}
		if(plotRequest[[1]] != "NA") try({ plotGraph(plotRequest[[1]]$market,plotRequest[[1]]$company,plotRequest[[1]]$graphType,plotRequest[[1]]$timeFrame, vp = vplayout(1, 1:2)) });
		if(plotRequest[[2]] != "NA") try({ plotGraph(plotRequest[[2]]$market,plotRequest[[2]]$company,plotRequest[[2]]$graphType,plotRequest[[2]]$timeFrame, vp = vplayout(2, 1:2)) });
	}

	if(numberOfGraphs==3){
		grid.newpage();
		pushViewport(viewport(layout = grid.layout(2, 2)));
		vplayout <- function(x, y){
			viewport(layout.pos.row = x, layout.pos.col = y);
		}
		if(plotRequest[[1]] != "NA") try({ plotGraph(plotRequest[[1]]$market,plotRequest[[1]]$company,plotRequest[[1]]$graphType,plotRequest[[1]]$timeFrame, vp = vplayout(1, 1:2)) });
		if(plotRequest[[2]] != "NA") try({ plotGraph(plotRequest[[2]]$market,plotRequest[[2]]$company,plotRequest[[2]]$graphType,plotRequest[[2]]$timeFrame, vp = vplayout(2, 1)) });
		if(plotRequest[[3]] != "NA") try({ plotGraph(plotRequest[[3]]$market,plotRequest[[3]]$company,plotRequest[[3]]$graphType,plotRequest[[3]]$timeFrame, vp = vplayout(2, 2)) });
	}

	if(numberOfGraphs==4){
		grid.newpage();
		pushViewport(viewport(layout = grid.layout(2, 2)));
		vplayout <- function(x, y){
			viewport(layout.pos.row = x, layout.pos.col = y);
		}
		if(plotRequest[[1]] != "NA") try({ plotGraph(plotRequest[[1]]$market,plotRequest[[1]]$company,plotRequest[[1]]$graphType,plotRequest[[1]]$timeFrame, vp = vplayout(1, 1)) });
		if(plotRequest[[2]] != "NA") try({ plotGraph(plotRequest[[2]]$market,plotRequest[[2]]$company,plotRequest[[2]]$graphType,plotRequest[[2]]$timeFrame, vp = vplayout(1, 2)) });
		if(plotRequest[[3]] != "NA") try({ plotGraph(plotRequest[[3]]$market,plotRequest[[3]]$company,plotRequest[[3]]$graphType,plotRequest[[3]]$timeFrame, vp = vplayout(2, 1)) });
		if(plotRequest[[4]] != "NA") try({ plotGraph(plotRequest[[4]]$market,plotRequest[[4]]$company,plotRequest[[4]]$graphType,plotRequest[[4]]$timeFrame, vp = vplayout(2, 2)) });
	}

	dev.off();