if [ -d /var/www/yeroon ] ; then
	sudo rm -Rf /var/www/yeroon;
	echo "wiping /var/www/yeroon"
fi

if [ -d /usr/lib/yeroon ] ; then
	sudo rm -Rf /usr/lib/yeroon;
	echo "wiping /usr/lib/yeroon"
fi

sudo mkdir /var/www/yeroon;
sudo mkdir /usr/lib/yeroon;

cd ext-3.2.0/install/
sudo sh install.sh;

cd ../../jsdeployr/install/
sudo sh install.sh;

cd ../../ggplot2/install/
sudo sh install.sh;

cd ../../stockplot/install/
sudo sh install.sh;