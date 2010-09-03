sudo apt-get -y install git-core

cd /usr/lib/yeroon/;
git clone git://github.com/jeroenooms/JSDeployR.git;

if [ ! -e /var/www/yeroon/JSDeployR ] ; then
	ln -s /usr/lib/yeroon/JSDeployR /var/www/yeroon/jsdeployr; #yeroon names are lower case 
fi