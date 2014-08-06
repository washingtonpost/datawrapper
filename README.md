# Datawrapper

Datawrapper is a tool that enables anyone to create enticing visualizations in seconds, without any programming skills. This is the Washington Post's fork, and is very much a work in process on the non-master branches.

##Installation instructions:

[Here are the published instructions](https://github.com/datawrapper/datawrapper/wiki/Installing-Datawrapper) which have a few errors/omissions (pull request is pending merge w/ origin) so below are our instructions, geared towards using MAMP for php/apache/mySQL (but anything will do).

- Install [MAMP](http://www.mamp.info/en/)
- In `/Applications/MAMP/htdocs` clone this repo
- In MAMP preferences, point Apache to `datawrapper/www`
- In MAMP preferences, make sure you're using PHP > 5.2 (5.5.X is stable)
- Create the configuration file by copying config.yaml.template to config.yaml, edit the file, and change domain and chart_domain and the email addresses, as well as s3 configuration and, if using, ldap settings.
- Create a new MySQL database called datawrapper. Then, initialize the table schema using `/lib/core/build/sql/schema.sql`. In MAMP, this is straightforward through the phpMyAdmin SQL backend.
- Copy `lib/core/build/conf/datawrapper-conf.php.master` to `lib/core/build/conf/datawrapper-conf.php` and update your database settings (dbname, user, password) according to your server configuration.
- Install plugins through `php scripts/plugin.php install pluginname`. The plugins you need are:
	- admin*
	- core*
	- publish-s3
	- theme-wapo
	- visualization*
- Run ./dw.js/make
- Locally with MAMP, navigate to http://localhost:8888/ and get charting!


## Known bugs

- Some versions of Firefox: Clicking on chart create button redirects to homepage. #6
- Some versions of Firefox (noticed on v. 30): Upload data button gives alert "Error:
  false" and does not upload the data. #7
- In some cases, logging in from / which redirects to /login results in a redirect loop error. #5

It draws inspiration from [ManyEyes](http://www-958.ibm.com/software/data/cognos/manyeyes/) and [GoogleCharts](https://developers.google.com/chart/) but remains entirely open-source and independent from a third-party server.

It was created by [Mirko Lorenz](http://www.mirkolorenz.com/), [Nicolas Kayser-Bril](http://nkb.fr) and [Gregor Aisch](http://driven-by-data.net/) and was funded by [ABZV](http://www.abzv.de/).

* Live service: <http://datawrapper.de/>
* Documentation: <http://docs.datawrapper.de/> ([Install](http://docs.datawrapper.de/en/install/))

## Contact

* IRC: #datawrapper on [freenode.net](https://webchat.freenode.net/)
* Twitter: [@datawrapper](http://twitter.com/datawrapper)
* Blog: [blog.datawrapper.de](http://blog.datawrapper.de)

## Translators

* French - [Anne-Lise Bouyer](https://crowdin.net/profile/annelise)
* Spanish - [Miguel Paz](https://github.com/miguelpaz)
* Italian - [Alessio Cimarelli](https://crowdin.net/profile/jenkin), [nelsonmau](https://crowdin.net/profile/nelsonmau)
* Chinese - [CUI Anyong](https://github.com/xiaoyongzi)
* Portuguese - [Rubens Fernando](https://crowdin.net/profile/rubensfernando)

If you want to contribute translations, contact us via [Crowdin.net](https://crowdin.net/project/datawrapper).
