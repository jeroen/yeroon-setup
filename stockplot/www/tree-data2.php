<?php

$user="stockplot";
$password="stockpass";
$database="stockplot";
$con = mysql_connect('localhost',$user,$password);
@mysql_select_db($database) or die( "Unable to select database");

// real code:

$node = $_REQUEST['node'];

if($node == 'root2'){

	// add blaat to prevent double ID's in the document.

	print "[{'id':'Ablaat','text':'A','expanded':false},
			{'id':'Bblaat','text':'B','expanded':false},
			{'id':'Cblaat','text':'C','expanded':false},
			{'id':'Dblaat','text':'D','expanded':false},
			{'id':'Eblaat','text':'E','expanded':false},
			{'id':'Fblaat','text':'F','expanded':false},
			{'id':'Gblaat','text':'G','expanded':false},
			{'id':'Hblaat','text':'H','expanded':false},
			{'id':'Iblaat','text':'I','expanded':false},
			{'id':'Jblaat','text':'J','expanded':false},
			{'id':'Kblaat','text':'K','expanded':false},
			{'id':'Lblaat','text':'L','expanded':false},
			{'id':'Mblaat','text':'M','expanded':false},
			{'id':'Nblaat','text':'N','expanded':false},
			{'id':'Oblaat','text':'O','expanded':false},
			{'id':'Pblaat','text':'P','expanded':false},
			{'id':'Qblaat','text':'Q','expanded':false},
			{'id':'Rblaat','text':'R','expanded':false},
			{'id':'Sblaat','text':'S','expanded':false},
			{'id':'Tblaat','text':'T','expanded':false},
			{'id':'Ublaat','text':'U','expanded':false},
			{'id':'Vblaat','text':'V','expanded':false},
			{'id':'Wblaat','text':'W','expanded':false},
			{'id':'Xblaat','text':'X','expanded':false},
			{'id':'Yblaat','text':'Y','expanded':false},
			{'id':'Zblaat','text':'Z','expanded':false},
			{'id':'#blaat','text':'#','expanded':false}]";

	
}
else{
	
	if($node[0]=='#'){
		$sql = "SELECT DISTINCT SYMBOL SYMBOL, NAME FROM INDICES WHERE NAME LIKE  '1%' OR NAME LIKE  '2%' OR NAME LIKE  '3%' OR NAME LIKE '4%' OR NAME LIKE  '5%' OR NAME LIKE '6%' OR NAME LIKE '7%' OR NAME LIKE  '8%' OR NAME LIKE  '9%' OR NAME LIKE  '0%'";
	} else {
		$sql = "select DISTINCT SYMBOL SYMBOL,NAME from INDICES where NAME like '" . $node[0] . "%'";
	}
	$arr = array();
	$result = mysql_query($sql);

	while($row = mysql_fetch_object($result)){
		$id = $row->SYMBOL;
		$text = $row->NAME;
		$nodes[] = array('id'=>(rand(101, 999) . $id), 'text'=>$text, 'leaf'=>true);
	}
	print json_encode($nodes);
}

mysql_close($con);
?>