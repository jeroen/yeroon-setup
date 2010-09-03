library(lme4);

doAnova <- function(modelList){

    numberModels <- length(modelList);
    if(numberModels < 2 | numberModels > 9 )
      return;
    for(i in 1:numberModels){
        modelName <- paste("Model",i,sep="");
        assign(modelName,modelList[[i]]);
    }
    myAnova <- NULL;
    switch(as.character(numberModels),
      "2" = {myAnova <- anova(Model1,Model2)},
      "3" = {myAnova <- anova(Model1,Model2,Model3)},
      "4" = {myAnova <- anova(Model1,Model2,Model3,Model4)},
      "5" = {myAnova <- anova(Model1,Model2,Model3,Model4,Model5)},
      "6" = {myAnova <- anova(Model1,Model2,Model3,Model4,Model5,Model6)},
      "7" = {myAnova <- anova(Model1,Model2,Model3,Model4,Model5,Model6,Model7)},
      "8" = {myAnova <- anova(Model1,Model2,Model3,Model4,Model5,Model6,Model7,Model8)},
      "9" = {myAnova <- anova(Model1,Model2,Model3,Model4,Model5,Model6,Model7,Model8,Model9)}
    );

    Name <- rownames(myAnova);   
    rownames(myAnova) <- NULL;
    
    myAnova[4] <- round(myAnova[4],3);
    myAnova[5] <- round(myAnova[5],3);
    myAnova[7] <- round(myAnova[7],3);

    myAnova <- cbind(Name,myAnova);
    return(apply(myAnova,1,as.list));
}

lme2json <- function(myModel,ranefplots,allgroups,myModelList){

  outputTree <- list();
  
  #Model predictors formula
  outputTree$formula <- attr(myModel,"predictorString");

  #Predictor term labels.
  outputTree$termlabels <- as.list(attr(terms(myModel),"term.labels"));

  #Dataclasses. Note: first term is the DV!
  outputTree$dataClasses <- as.list(attr(terms(myModel),"dataClasses"));

  #fixed effects
  termlabels <- attr(terms(myModel),"term.labels");
  termlabels[99] <- "Intercept";
  assignments <- attr(model.matrix(myModel),"assign");
  assignments[assignments==0] <- 99;

  fixed <- round(fixef(myModel),3);
  termnames <- names(fixed);
  SE <- round(sqrt(diag(as.matrix(vcov(myModel)))),3);
  tvalue <- round(abs(fixed/SE),3);
  factors <- termlabels[assignments];
  assigns <- attr(model.matrix(myModel),"assign");
  ids <- 1:length(fixed);

  output <- data.frame(id=ids,name=termnames,estimate=fixed,SE=SE, tvalue=tvalue, assign=assigns,factor=factors,row.names = NULL);
  outputTree$fixef <- apply(output,1,as.list);

  #Covariance matrix of fixed effects
  fixedCov <- list()
  fixedCov[["fields"]] <- as.list(termnames);
  fixedCov[["data"]] <- apply(as.matrix(signif(vcov(myModel),3)),2,as.list);
  outputTree$fixedCov <- fixedCov;

  #Correlation matrix of fixed effects
  fixedCor <- list()
  fixedCor[["fields"]] <- as.list(termnames);
  fixedCor[["data"]] <- apply(round(cov2cor(as.matrix(vcov(myModel))),3),2,as.list);
  outputTree$fixedCor <- fixedCor;

  #Covariance matrix of random effects
  varcor1 <- VarCorr(myModel);
  
  #IMPORTANT: this part tries to re-order the lmer output into the orriginal order of the terms
  #It is highly vulnerable to any changes in the lmer output. 
  #It might also fail when there are multiple terms with the same grouping variable.
  
  if(length(unique(allgroups))>1){
      varcor2 <- list();
      for(i in 1:length(allgroups)){
          thisGroup <- allgroups[i];
          varcor2[i] <- varcor1[thisGroup];
          varcor1[thisGroup] <- NULL;
      }
      attr(varcor2,"names") <- allgroups ;  
  } else { varcor2 <- varcor1 }
   ##############################################################
   ##############################################################

  newVarcor <- list();
  for(i in 1:length(varcor2)){   
      
      newVarcor[[i]] <- list();
      newVarcor[[i]]$group <- names(varcor2)[i];
      newVarcor[[i]]$fields <- as.list(dimnames(varcor2[[i]])[[1]]);
      newVarcorMatrix <- signif(varcor2[[i]],3);
      attr(newVarcorMatrix,"dimnames") <- NULL;
      newVarcor[[i]]$CovMatrix <- apply(newVarcorMatrix,2,as.list);

      variances <- diag(round(varcor2[[i]],3));
      output <- data.frame(id=1:length(variances),name=names(variances),variance=as.numeric(variances),sd=round(sqrt(as.numeric(variances)),3),row.names=NULL);
      newVarcor[[i]]$variances <- apply(output,1,as.list);
      
      newCorMatrix <- round(as.matrix(attr(varcor2[[i]],"correlation")),3);
      attr(newCorMatrix,"dimnames") <- NULL;
      newVarcor[[i]]$CorMatrix <- apply(newCorMatrix,2,as.list);  
  }
  outputTree$randomCovMatrices <- newVarcor;    
  
  #Model selection stuff
  
  outputTree$REML <- as.character(attr(logLik(myModel),"REML"));
   
  myLL <- round(logLik(myModel)[1],3);
  names(myLL) <- NULL; 
  outputTree$LL <- myLL;   
  
  myDeviance <- round(-2*logLik(myModel)[1],3);
  names(myDeviance) <- NULL;
  outputTree$Deviance <- myDeviance;
  
  myDF <-  attr(logLik(myModel),"df");
  names(myDF) <- NULL;
  outputTree$DF <- myDF;
  
  mySigma <- round(attr(varcor1,"sc"),3);
  names(mySigma) <- NULL;
  outputTree$Sigma <- mySigma;
  
  myAIC <- round(BIC(logLik(myModel)),3);
  names(myAIC) <- NULL;
  outputTree$AIC <- myAIC;
   
  myBIC <- round(AIC(logLik(myModel)),3);
  names(myBIC) <- NULL;
  outputTree$BIC <- myBIC;

  #Raw random effects

  randomEffects <- ranef(myModel);    
  myRanef = list();
  
  for(i in 1:length(randomEffects)) {
    randomEffects[[i]] <- round(randomEffects[[i]],3);
    if(any(duplicated(names(randomEffects[[i]])))) stop("There is a duplicate random term in the model!");
    
    thisGroup <- names(randomEffects[i]);
    
    myRanef[[thisGroup]] <- list();
    myRanef[[thisGroup]]$group <- as.list(names(randomEffects[i]));
    myRanef[[thisGroup]]$fields <- as.list(names(randomEffects[[i]]));
    myRanef[[thisGroup]]$rownames <- as.list(rownames(randomEffects[[i]]));
    myRanef[[thisGroup]]$plotfile <- ranefplots[i];
    myRanefData <- as.matrix(randomEffects[[i]]);
    attr(myRanefData,"dimnames") <- NULL;
    myRanef[[thisGroup]]$data <- apply(myRanefData,1,as.list);
  }
  outputTree$ranef <- myRanef;
 
  if(length(myModelList) > 1) 
    try({outputTree$anova <- doAnova(myModelList)});

  return(outputTree);
}
    
fitModel <- function(){

  lmeRequest <- inputs$lmeRequest; 

	reml <- as.logical(lmeRequest$reml);
    dependent <- lmeRequest$dependent;
    DVfamily <- lmeRequest$DVfamily;
    fixedIV <- lmeRequest$fixedIV;
    randomIV <- lmeRequest$randomIV;
    dataFile <- lmeRequest$dataFile;
    thisModelNumber <- lmeRequest$thisModelNumber;
    
    if(is.null(dependent) || (dependent=="")) stop("No dependent variable selected!");
    if(is.null(DVfamily) || (DVfamily=="")) DVfamily <- "gaussian";

    dataFileDest <- file.path('Rdatafiles',paste(dataFile,'.RData',sep=""));
    load(dataFileDest);

    randomTerms <- vector();
    if(length(randomIV)==0) {stop("No Random Effect Terms Found") }
    
    allgroups <- vector();
    for(i in 1:length(randomIV)){
        allgroups[i] <-  randomIV[[i]]$group;
        group <- randomIV[[i]]$group;
        predictors <- randomIV[[i]]$predictors;
        if(any(isint <- predictors=="Intercept")) { predictors <- c("1",predictors[!isint]);
        } else { predictors <- c("0",predictors); }
        predictorFormula <- paste(predictors,collapse="+");
        thisTerm <- paste("(",predictorFormula,"|",group,")",sep="");
        randomTerms[i] <- thisTerm
    }
            
   
    #######################
    
    if(any(isintf <- fixedIV=="Intercept")) { fixedIV <- c("1",fixedIV[!isintf]);
    } else { fixedIV <- c("0",fixedIV); }
    
    predictorString <- paste(c(fixedIV,randomTerms),collapse=" + ");
    modelFormula <- as.formula(paste(dependent,"~",predictorString,sep=""));

    myModel <- glmer(modelFormula, family=DVfamily, data=mydata, REML=reml);
    attr(myModel,"predictorString") <- predictorString; 
    
    getRanef <- function(myModel){
      tryCatch(return(ranef(myModel,T)),error=function(e){return(ranef(myModel))});
    }
    
    myPlotRanef <- getRanef(myModel);
    ranefplots <- vector();
    
    for(i in 1:length(myPlotRanef)){
        pdf(file=paste("ranefplot", i,".pdf",sep=""),width = 16, height = 12,paper = "a4r", title = paste("Random Effects:",names(myPlotRanef)[i]));
        print(dotplot(myPlotRanef,scales = list(x = list(relation = 'free')))[[i]]);
        dev.off();
    }  
    
    myModelList[[thisModelNumber]] <- myModel;
    
    outputTree <- lme2json(myModel,ranefplots,allgroups,myModelList);
    return(outputTree);
}   

modelFit <- fitModel();
