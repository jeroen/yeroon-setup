if [ ! -d /usr/lib/yeroon/ext-3.2.0 ] ; then
	mkdir /usr/lib/yeroon/ext-3.2.0;
fi

cp -Rf ../www /usr/lib/yeroon/ext-3.2.0/

if [ ! -e /var/www/yeroon/ext-3.2.0 ] ; then
	ln -s /usr/lib/yeroon/ext-3.2.0/www /var/www/yeroon/ext-3.2.0;
fi