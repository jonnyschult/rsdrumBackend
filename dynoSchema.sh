//Try bool in AWS 
 

aws dynamodb put-item \
    --table-name rsdrum \
    --item \
     '{"id": {"S": "asdf-fdsa-blah-yoyo"}, "category": {"S": "users"}, "email": {"S": "test@test.com"}, "passwordhash": {"S": "testpass"}, "DOB": {"S": "09/12/1989"}, "active": {"BOOL": true}, "student": {"BOOL": true}, "admin": {"BOOL": true}, "firstName": {"S": "Jonny"}, "lastName": {"S": "Schult"}}' \
    --return-consumed-capacity TOTAL \
--endpoint-url http://localhost:8000

aws dynamodb put-item \
    --table-name rsdrum \
    --item \
     '{"id": {"S": "asdf-fdsa-blah-yoyo"}, "category": {"S": "comments"}, "comments_list": {"L": [{"M": {"comment_text": {"S": "YOLO"}, "createdAt": {"S": "now"}}}]}}' \
    --return-consumed-capacity TOTAL \
--endpoint-url http://localhost:8000

aws dynamodb create-table \
    --table-name rsdrum \
    --attribute-definitions \
        AttributeName=id,AttributeType=S \
        AttributeName=category,AttributeType=S \
    --key-schema \
        AttributeName=id,KeyType=HASH \
        AttributeName=category,KeyType=RANGE \
--provisioned-throughput \
        ReadCapacityUnits=10,WriteCapacityUnits=5 \
--endpoint-url http://localhost:8000

     '{"id": {"S": "asdf-fdsa-blah-yoyo"}, "email": {"S": "test@test.com"}, "passwordhash": {"S": "testpass"}, 
     "DOB": {"S": "09/12/1989"}, "active": {"BOOL": true}, "student": {"BOOL": true}, "admin": {"BOOL": true}, 
     "firstName": {"S": "Jonny"}, "lastName": {"S": "Schult"}}' \
