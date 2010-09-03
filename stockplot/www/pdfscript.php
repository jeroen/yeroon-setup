<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN">
<html>
<head>
<title>PDF redirect</title>
<?php

/*
To use the script in safe mode, open php.ini and edit:

safe_mode = On
safe_mode_exec_dir = "C:\Progra~2\R\R-2.9.1\bin\"

or whatever the Rscript.exe path is.

*/ 

// change this to your R bin and scripts directory (use backslashes for directory's, and no backslash at the end). 
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

$market = escapeshellarg($_REQUEST["market"]);
$company = escapeshellarg($_REQUEST["company"]);
$graphType = escapeshellarg($_REQUEST["graphType"]);
$timeFrame = escapeshellarg($_REQUEST["timeFrame"]);

if (stristr(PHP_OS, 'WIN')) { 
	if( ini_get('safe_mode') ){
		$cmd = $R_DIRECTORY. '\RScript --vanilla '.$RSCRIPTS_DIRECTORY.'\YHpdfplot.r '.$market." ".$company." ".$graphType." ".$timeFrame;
	}else{
		$cmd = escapeshellcmd($R_DIRECTORY. '\RScript --vanilla '.$RSCRIPTS_DIRECTORY.'\YHpdfplot.r '.$market." ".$company." ".$graphType." ".$timeFrame);
	}
}
else{
	if( ini_get('safe_mode') ){
		$cmd = $R_DIRECTORY. '/Rscript --vanilla '.$RSCRIPTS_DIRECTORY.'/YHpdfplot.r '.$market." ".$company." ".$graphType." ".$timeFrame;
	}else{
		$cmd = escapeshellcmd($R_DIRECTORY. '/Rscript --vanilla '.$RSCRIPTS_DIRECTORY.'/YHpdfplot.r '.$market." ".$company." ".$graphType." ".$timeFrame);
	}
}

//echo($cmd); //debug

exec($cmd, $output, $return);

if($return==0){ 
	echo('<meta http-equiv="REFRESH" content="0;url=plots/.'.$output[0].'.pdf">');
	//var_dump($output); //debug
	echo("</HEAD><BODY>");
	echo("You are being redirected to the PDF. If nothing happens, click <a href=\"plots/.".$output[0].".pdf\"> here </a>");
	echo("</BODY></HTML>");	
}
else{
	//echo("Non-zero exit status. Probably an error in R (too much missing data?)\n");
	//var_dump($output);
	//echo("PHP encountered non-zero exit status. Probably an uncatched error in R.\n");
	echo("<HTML><HEAD><TITLE>ERROR</TITLE></HEAD><BODY>");
	echo('<img class="errorImage" src="images/error.png" />');
	echo("</BODY></HTML>");
}

?>



