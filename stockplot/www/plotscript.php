<?php

/*
To use the script in safe mode, open php.ini and edit:

safe_mode = On
safe_mode_exec_dir = "C:\Progra~2\R\R-2.9.1\bin\"

or whatever the Rscript.exe path is.

*/ 

//change this to your R bin and scripts directory (use backslashes for directory's, and no backslash at the end). 


if (stristr(PHP_OS, 'WIN')) { 
	// INSERT PATHS HERE IF SERVER RUNS WINDOWS
	$R_DIRECTORY = 'C:\Progra~2\R\R-2.9.1\bin';
	$RSCRIPTS_DIRECTORY = 'C:\wamp\R';
} else{
	// INSERT PATHS HERE IF SERVER RUNS LINUX
	$R_DIRECTORY = '/usr/bin';
	$RSCRIPTS_DIRECTORY = '/home/stocks';
}

// real code starts here

$market = escapeshellarg($_POST["market"]);
$company = escapeshellarg($_POST["company"]);
$graphType = escapeshellarg($_POST["graphType"]);
$timeFrame = escapeshellarg($_POST["timeFrame"]);

if(isset($_POST['width']) & isset($_POST['height'])){
	$width = $_POST['width'];
	$height = $_POST['height'];
	
	if (stristr(PHP_OS, 'WIN')) { 
		if( ini_get('safe_mode') ){
			$cmd = $R_DIRECTORY. '\RScript --vanilla '.$RSCRIPTS_DIRECTORY.'\YHYHstocksplot.r '.$market." ".$company." ".$graphType." ".$timeFrame." ".$height." ".$width;
		}else{
			$cmd = escapeshellcmd($R_DIRECTORY. '\RScript --vanilla '.$RSCRIPTS_DIRECTORY.'\YHstocksplot.r '.$market." ".$company." ".$graphType." ".$timeFrame." ".$height." ".$width);
		}	
	} else{
		if( ini_get('safe_mode') ){
			$cmd = $R_DIRECTORY. '/Rscript --vanilla '.$RSCRIPTS_DIRECTORY.'/YHstocksplot.r '.$market." ".$company." ".$graphType." ".$timeFrame." ".$height." ".$width;
		}else{
			$cmd = escapeshellcmd($R_DIRECTORY. '/Rscript --vanilla '.$RSCRIPTS_DIRECTORY.'/YHstocksplot.r '.$market." ".$company." ".$graphType." ".$timeFrame." ".$height." ".$width);
		}	
	}
}

else{
	if (stristr(PHP_OS, 'WIN')) {
		if( ini_get('safe_mode') ){
			$cmd = $R_DIRECTORY. '\RScript --vanilla '.$RSCRIPTS_DIRECTORY.'\YHstocksplot.r '.$market." ".$company." ".$graphType." ".$timeFrame;
		}else{
			$cmd = escapeshellcmd($R_DIRECTORY. '\RScript --vanilla '.$RSCRIPTS_DIRECTORY.'\YHstocksplot.r '.$market." ".$company." ".$graphType." ".$timeFrame);
		}
	} else{
		if( ini_get('safe_mode') ){
			$cmd = $R_DIRECTORY. '/Rscript --vanilla '.$RSCRIPTS_DIRECTORY.'/YHstocksplot.r '.$market." ".$company." ".$graphType." ".$timeFrame;
		}else{
			$cmd = escapeshellcmd($R_DIRECTORY. '/Rscript --vanilla '.$RSCRIPTS_DIRECTORY.'/YHstocksplot.r '.$market." ".$company." ".$graphType." ".$timeFrame);
		}	
	}
}

//echo($cmd); //debug

exec($cmd, $output, $return);

if($return==0){ 
	echo('<img class="stocksGraph" src="plots/.'.$output[0].'.png" />');
	//var_dump($output); //debug
}
else{
	echo('<img class="errorImage" src="images/error.png" />');
	//echo("Non-zero exit status. Probably an error in R (too much missing data?)\n");
	//var_dump($output);
}


?>
