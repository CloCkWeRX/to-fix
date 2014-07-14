install:
	sh install.sh
	sh import.keepright.sh
	sh import.osmi.sh

reimport:
	make dropdbs
	sh import.keepright.sh
	sh.import.osmi.sh

keepright.sql:
	FILE="keepright-$(date +%s).sql"
	sudo -u postgres pg_dump keepright > $FILE
	echo "new backup: $FILE"

osmi.sql:
	FILE="osmi-$(date +%s).sql"
	sudo -u postgres pg_dump osmi > $FILE
	echo "new backup: $FILE"

backup:
	make keepright.sql
	make osmi.sql

dropdbs:
	echo 'dropping databases'
	echo "DROP DATABASE osmi;" | psql -U postgres
	echo "DROP DATABASE keepright;" | psql -U postgres

tasks:
	rm -rf keepright-tasks
	rm -rf osmi-tasks
	sh tasks.keepright.sh
	sh tasks.osmi.sh
	# need to figure out hashing

server:
	sudo ./node_modules/forever/bin/forever start index.js
