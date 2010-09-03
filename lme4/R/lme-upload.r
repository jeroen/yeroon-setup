    library(foreign);

    filepath <- inputs$filepath;
    filename <- inputs$filename;
    
    ######################### injection fix: ##########################
    filename <- gsub("[?:|*><{};\\/()#\"']","",filename);
    ###################################################################

    if(length(grep(".sav",filename))>0){
        mydata <- read.spss(filepath, reencode="utf8", to.data.frame=TRUE);
    } else if(length(grep(".csv",filename))>0){
        mydata <- read.csv(filepath,header=TRUE);
    } else { mydata <- read.table(filepath,header=TRUE); }
    
    myModelList <- list();
    
    outputTree <- list();
    factors <- names(mydata)[sapply(mydata,is.factor)];
    numerics <-  names(mydata)[!sapply(mydata,is.factor)];
    
    outputTree <- list();
    factors <- names(mydata)[sapply(mydata,is.factor)];
    numerics <-  names(mydata)[!sapply(mydata,is.factor)];
    
    outputTree[[1]] <- list(id='Factor',text='Factor',children=list());
    outputTree[[2]] <- list(id='Numeric',text='Numeric',children=list());
    outputTree[[3]] <- list(id='Intercept', text='Intercept', leaf=TRUE);
    
    if(length(factors) > 0){
      for(i in 1:length(factors)){
        outputTree[[1]]$children[[i]] <-  list(id=factors[i],text=factors[i],leaf=TRUE)
      }
    }
    if(length(numerics)>0){
      for(i in 1:length(numerics)){
        outputTree[[2]]$children[[i]] <-  list(id=numerics[i],text=numerics[i],leaf=TRUE)
      }
    }
    
    mySummary <- summary(mydata)
    mySummary <- rbind(colnames(mySummary),mySummary);
    colnames(mySummary) <- names(mydata);
    rownames(mySummary) <- NULL
    varInfo <- apply(mySummary,2,as.list);  
    
    #return outputTree, varInfo
