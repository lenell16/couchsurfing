App uses express and drizzle orm connected to a postgres db

# Start App

Run `docker compose up --build` This will start app and db

# Seeding db

1. Open seperate terminal window
2. run `docker exec -ti couchsurfing-postgres-1 /bin/bash`
3. run `psql -U user -d db`
4. paste contents of `seed.sql` and hit enter

### GET /users

curl http://localhost:3000/users

### GET /users/:id

curl http://localhost:3000/users/1

### POST /users

curl -X POST -H "Content-Type: application/json" -d '{"name": "John Doe", "email": "johndoe@example.com", "friends": [2, 3]}' http://localhost:3000/users

### PUT /users/:id

curl -X PUT -H "Content-Type: application/json" -d '{"name": "Jane Doe", "email": "janedoe@example.com", "friends": [3, 4]}' http://localhost:3000/users/1

### GET /relationship-distance/:fromUser/:toUser

curl http://localhost:3000/relationship-distance/1/2
