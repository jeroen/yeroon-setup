#!/bin/sh
# needed files: stockplot.sql, fillDB.r

apt-get -y install php5 mysql-server mysql-client php5-mysql;

cp stockplot.sql /tmp/stockplot.sql
printAttensionMsg() {
	echo "**********************************************************************"
	echo "*"
	echo "*     $@"
	echo "*"
	echo "**********************************************************************"
}

printAttensionMsg "Please enter mysql root password.  ('Enter' for null password)"
read PASSWORD
if [ 0 -eq ${#PASSWORD} ] ; then
	mysql -uroot -e "use mysql;delete user from mysql.user where User = ''stockplot;flush privileges;" >> /dev/null 2>&1
	mysql -uroot -e "use mysql;drop database stockplot;" >> /dev/null 2>&1
	mysql -uroot -e "CREATE USER 'stockplot'@'localhost' IDENTIFIED BY 'stockpass';" >> /dev/null 2>&1
	mysql -uroot -e "GRANT ALL ON *.* TO 'stockplot'@'localhost';" >> /dev/null 2>&1
else
	mysql -uroot -p$PASSWORD -e "use mysql;delete user from mysql.user where User = 'stockplot';flush privileges" >> /dev/null 2>&1
	mysql -uroot -p$PASSWORD -e "use mysql;drop database stockplot;" >> /dev/null 2>&1
	mysql -uroot -p$PASSWORD -e "CREATE USER 'stockplot'@'localhost' IDENTIFIED BY 'stockpass';" >> /dev/null 2>&1
	mysql -uroot -p$PASSWORD -e "GRANT ALL ON *.* TO 'stockplot'@'localhost';" >> /dev/null 2>&1
fi
mysql -ustockplot -pstockpass -e "create database stockplot default character set utf8 default collate utf8_unicode_ci;" >> /dev/null 2>&1
mysql -ustockplot -pstockpass stockplot < $1/tmp/stockplot.sql >> /dev/null 2>&1

/etc/init.d/mysqld restart >> /dev/null 2>&1
/etc/init.d/apache2 restart >> /dev/null 2>&1

if [ ! -d /usr/lib/yeroon/stockplot ] ; then
	mkdir /usr/lib/yeroon/stockplot
fi

cp -Rf ../R /usr/lib/yeroon/stockplot
cp -Rf ../www /usr/lib/yeroon/stockplot
cp -Rf ../etc /usr/lib/yeroon/stockplot

echo "Adding /var/www symlink"
if [ ! -e /var/www/yeroon/stockplot ] ; then
	ln -s /usr/lib/yeroon/stockplot/www /var/www/yeroon/stockplot 
fi

echo "INSTALLING CRONJOB!"
mycronjob="0 6 * * 2-7 Rscript /usr/lib/yeroon/stockplot/etc/fillDB.r > /usr/lib/yeroon/stockplot/etc/fillDB.log"
(crontab -l; echo "$mycronjob") | crontab -

echo "DOWNLOADING FROM YAHOO"
Rscript /usr/lib/yeroon/stockplot/etc/fillDB.r