<?php

$user="stockplot";
$password="stockpass";
$database="stockplot";
$con = mysql_connect('localhost',$user,$password);
@mysql_select_db($database) or die( "Unable to select database");

// real code:

$node = $_REQUEST['node'];

if($node == 'root1'){

	$sql= "SELECT DISTINCT SINDEX FROM INDICES ORDER BY SINDEX";
	$nodes = array();
	$result = mysql_query($sql);

	while($row = mysql_fetch_object($result)){
		$sindex = $row->SINDEX;
		$nodes[] = array('id'=>$sindex, 'text'=>$sindex, 'expanded'=>false);
	}
	print json_encode($nodes);	
	
}
else{
	//use case prevent sql injection:
	switch($node){
		case 'AEX':
			$sql="SELECT DISTINCT SYMBOL SYMBOL,NAME FROM INDICES WHERE  SINDEX = 'AEX' ORDER BY NAME";
			break;
		case 'DJI':
			$sql="SELECT DISTINCT SYMBOL SYMBOL,NAME FROM INDICES WHERE  SINDEX = 'DJI' ORDER BY NAME";
			break;			
		case 'NASDAQ':
			$sql="SELECT DISTINCT SYMBOL SYMBOL,NAME FROM INDICES WHERE  SINDEX = 'NASDAQ' ORDER BY NAME";
			break;			
		case 'SP':
			$sql="SELECT DISTINCT SYMBOL SYMBOL,NAME FROM INDICES WHERE  SINDEX = 'SP' ORDER BY NAME";
			break;			
		case 'FTSE':
			$sql="SELECT DISTINCT SYMBOL SYMBOL,NAME FROM INDICES WHERE  SINDEX = 'FTSE' ORDER BY NAME";
			break;			
		case 'DAX':
			$sql="SELECT DISTINCT SYMBOL SYMBOL,NAME FROM INDICES WHERE  SINDEX = 'DAX' ORDER BY NAME";
			break;			
		case 'CAC':
			$sql="SELECT DISTINCT SYMBOL SYMBOL,NAME FROM INDICES WHERE  SINDEX = 'CAC' ORDER BY NAME";
			break;			
		case 'MIB':
			$sql="SELECT DISTINCT SYMBOL SYMBOL,NAME FROM INDICES WHERE  SINDEX = 'MIB' ORDER BY NAME";
			break;			
		case 'COP':
			$sql="SELECT DISTINCT SYMBOL SYMBOL,NAME FROM INDICES WHERE  SINDEX = 'COP' ORDER BY NAME";
			break;			
		case 'STO':
			$sql="SELECT DISTINCT SYMBOL SYMBOL,NAME FROM INDICES WHERE  SINDEX = 'STO' ORDER BY NAME";
			break;			
	}


	$arr = array();
	$result = mysql_query($sql);

	while($row = mysql_fetch_object($result)){
		$id = $row->SYMBOL;
		$text = $row->NAME;
		$nodes[] = array('id'=> (rand(101, 999) . $id), 'text'=>$text, 'leaf'=>true);
	}
	print json_encode($nodes);
}

mysql_close($con);
?>