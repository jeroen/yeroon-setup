if [ ! -d /usr/lib/yeroon/ggplot2 ] ; then
	mkdir /usr/lib/yeroon/ggplot2;
fi

cp -Rf ../www /usr/lib/yeroon/ggplot2/;

if [ ! -e /var/www/yeroon/ggplot2 ] ; then
	ln -s /usr/lib/yeroon/ggplot2/www /var/www/yeroon/ggplot2;
fi