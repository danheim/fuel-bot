up:
	docker-compose up

down:
	docker-compose down

remove:
	docker-compose rm -fsv $(s)

build:
	docker-compose build --no-cache $(s)

rebuild: remove build
