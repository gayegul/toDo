## toDo Web App
A MEAN stack to do app

All routes start with `/api`

#### USER ROUTES
`/users/signup`  

POST  
creates a user

`/users/:username`  

GET  
returns a specific user

PUT  
updates user info

DELETE  
deletes a specific user

#### ITEM ROUTES
`/items`  

GET  
returns all items for a given user

POST  
creates a new task for a given user

`/items/:name`  

GET  
returns specific item

PUT  
updates specific item

DELETE  
deletes specific item

#### ADMIN ROUTES

`/admin/users`  

GET  
returns all users
