is.Date <- function(x) {return(any(is(x)=="Date"))}

if(!exists("myData")){
stop("myData was not found in the workspace");
}

outputTree <- list();
factors <- names(myData)[sapply(myData,is.factor)];
Dates <- names(myData)[sapply(myData,is.Date)];
numerics <-  names(myData)[!sapply(myData,is.factor) & !sapply(myData,is.Date)];

outputTree$factors <- list(draggable=F, id='ggfolder_Factor',text='Factor',children=list());
outputTree$numerics <- list(draggable=F, id='ggfolder_Numeric',text='Numeric',children=list());
outputTree$dates <- list(draggable=F, id='ggfolder_Date',text='Date',children=list());
#outputTree[[3]] <- list(id='Intercept', text='Intercept', leaf=TRUE);

if(length(factors) > 0){
for(i in 1:length(factors)){
  outputTree$factors$children[[i]] <-  list(id=factors[i],text=factors[i],leaf=TRUE)
}
}
if(length(numerics)>0){
for(i in 1:length(numerics)){
  outputTree$numerics$children[[i]] <-  list(id=numerics[i],text=numerics[i],leaf=TRUE)
}
}
if(length(Dates) > 0){
for(i in 1:length(Dates)){
  outputTree$dates$children[[i]] <-  list(id=Dates[i],text=Dates[i],leaf=TRUE)
}
}
