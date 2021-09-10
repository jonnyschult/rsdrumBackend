aws dynamodb create-table \
    --table-name rsdrum \
    --attribute-definitions \
        AttributeName=id,AttributeType=S \
        AttributeName=category,AttributeType=S \
    --key-schema \
        AttributeName=category,KeyType=HASH \
        AttributeName=id,KeyType=RANGE \
--provisioned-throughput \
        ReadCapacityUnits=10,WriteCapacityUnits=5 \
--endpoint-url http://localhost:8000

curl --header "Content-Type: application/json" --request POST --data '{  "info": { "email": "admin@test.com", "firstName": "Bob", "lastName": "Schult", "password": "testpass", "DOB": "11/25/1955", "admin": true, "student": false, "active": true}}' http://localhost:4040/users/register