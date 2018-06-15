#!/bin/bash

# If there is an existing configuration
# given as a volume, just take it.
if [ -f config/config.json ]; then
	mv config/config.json config/default.json
else
	./bin/opla init \
		--non-interactive \
		--database-host $OPLA_BACKEND_DATABASE_HOST \
		--database-name $OPLA_BACKEND_DATABASE_NAME \
		--database-user $OPLA_BACKEND_DATABASE_USER \
		--database-pass $OPLA_BACKEND_DATABASE_PASS

fi

if [ -n "$SKIP_MIGRATION" -a "$SKIP_MIGRATION" = 'true' ]; then
	echo "Skipping migrations."
else
	until nc -z -v -w30 $OPLA_BACKEND_DATABASE_HOST $OPLA_BACKEND_DATABASE_PORT; do
		echo "Waiting for database connection..."
		# wait for 2 seconds before check again
		sleep 1
	done
	./bin/opla migrations up --non-interactive
fi

if [ -n "$MIGRATIONS_ONLY" -a "$MIGRATIONS_ONLY" = 'true' ]; then
	echo "MIGRATIONS_ONLY. Not executing node."
else
	exec node --inspect=0.0.0.0:9229 dist/
fi
