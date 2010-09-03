library(ggplot2);

myPlot = NULL;

plotConfig <- inputs$plotConfig;

plotWidth <- plotConfig[["width"]];
plotHeight <- plotConfig[["height"]];	

x <- substring(plotConfig[["x"]],5);
y <- substring(plotConfig[["y"]],5);

myPlot <- ggplot(myData) + aes_string(x=x, y=y);

if(!is.null(plotConfig[["weight"]])){
	weight <- substring(plotConfig[["weight"]],5);
	myPlot <- myPlot + aes_string(weight=weight);	
}	

if(!is.null(plotConfig[["group"]])){
	group <- substring(plotConfig[["group"]],5);
	myPlot <- myPlot + aes_string(group=group);
}

if(!is.null(plotConfig[["colour"]])){
	colour <- substring(plotConfig[["colour"]],5);
	myPlot <- myPlot + aes_string(colour=colour);
}

if(!is.null(plotConfig[["facet"]][["map"]])){
	facet <- substring(plotConfig[["facet"]][["map"]],5);
	if(!is.null(plotConfig[["facet"]][["scales"]])){
		scales = substring(plotConfig[["facet"]][["scales"]],5);
	} else {
		scales = "fixed";
	}
	if(!is.null(plotConfig[["facet"]][["nrow"]])){
		nrow = as.numeric(substring(plotConfig[["facet"]][["nrow"]],5));
	} else {
		nrow = NULL;
	}		
	myPlot <- myPlot + facet_wrap(as.formula(paste("~",facet)), nrow=nrow, scales=scales);
}

layers <- plotConfig$layers;

if(length(layers) < 1){
	if((y=="..density..") || (y=="..count..")){
		myPlot <- myPlot + geom_blank(stat="bin");
	} else {
		myPlot <- myPlot + geom_blank();
	}
} else{

	for(i in 1:length(layers)){

		thisLayer <- layers[[i]];
		thisAesthetics <- list();

		#note: loop has to be backwards because of the removing of elements by <- NULL;

		for(j in length(thisLayer):1){

			thisValue <- thisLayer[[j]];
			if(substr(thisValue,1,3) == "set"){
				thisLayer[[j]] <- substring(thisValue,5)

				#temp fixes:
				if(thisLayer[[j]] == "FALSE" || thisLayer[[j]] == "TRUE") {
					thisLayer[[j]] <- as.logical(thisLayer[[j]]);
				}

				thisProperty <- names(thisLayer[j]);
				if(thisProperty == "width" || thisProperty == "xintercept" || thisProperty == "yintercept" || thisProperty == "intercept" || thisProperty == "slope" || thisProperty == "binwidth" || thisProperty == "alpha" || thisProperty == "size" || thisProperty == "weight" || thisProperty == "adjust"|| thisProperty == "shape" || thisProperty == "bins" || thisProperty == "angle"){
					thisLayer[[j]] <- as.numeric(thisLayer[[j]]);
				}

				if(thisProperty == "number"){
					Nquantiles <- as.numeric(thisLayer[[j]]) + 2;
					quantiles <- seq(0,1,length.out=Nquantiles);
					quantiles <- quantiles[-c(1,Nquantiles)];
					thisLayer$quantiles <- quantiles;
					thisLayer[j] <- NULL;
				}					
			}

			###

			if(substr(thisValue,1,3) == "map"){
				mapVariable <- substring(thisValue,5);
				mapProperty <- names(thisLayer[j]);
				thisAesthetics[mapProperty] = mapVariable;
				thisLayer[j] <- NULL;
			}
		}
		if(length(thisAesthetics) > 0){

			myMappings <- as.call(append(thisAesthetics,aes_string,after=0));
			thisLayer$mapping <- myMappings
		}
		myPlot <- myPlot + eval(as.call(append(thisLayer,layer,after=0)));
	}
}

svg("plot.svg");
print(myPlot);
dev.off();