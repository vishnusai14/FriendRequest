require("dotenv").config()
const express = require("express")
const bodyParser = require("body-parser")
const db = require("./database/database")
const app = express()
const JWT = require("jsonwebtoken")
const cors = require("cors")
const path = require("path")

const SECRET = process.env.SECRET

const PORT = process.env.PORT || 5050

// Creating New Table For Friends Relations If not Exist

let create = `CREATE TABLE "newfriend" (
    "friend_one" INT(11) ,
    "friend_two" INT(11) ,
    "status" INT DEFAULT '0',
    "friend_one_name" TEXT,
    "friend_two_name" TEXT,
    PRIMARY KEY ("friend_one","friend_two"),
    FOREIGN KEY (friend_one) REFERENCES users(user_id),
    FOREIGN KEY (friend_two) REFERENCES users(user_id));`

let createUser = `CREATE TABLE "user"(
    "user_id" INTEGER PRIMARY KEY AUTOINCREMENT ,
    "username" TEXT,
    "password" TEXT
)`


db.run(create, (result, err) => {
    if(err){
        console.log(err)
    }else {
        console.log(result)
    }
})


db.run(createUser, (result, err) => {
    if(err){
        console.log(err)
    }else {
        console.log(result)
    }
})


app.use(bodyParser.json())



app.use(cors())


// This Route Get Executed Whenver user tries to reach any page it will get the token and verify it hence unauthnticard user will not be enter

app.post("/check" , (req, res) => {
	  let token = undefined
    try {
        token = req.body.token
    }catch(err){
        token = undefined
    }
    if(token !== undefined){
        let user = undefined
        try {
             user = JWT.verify(token, SECRET)
        } catch (error) {
            res.status(404).send({error : "Error"})
	    res.end()
        }
        if(user){
            let user_id = user.user_id
            let username = user.username
            let sql = `SELECT  username, password, user_id FROM user WHERE username = ?`
            db.get(sql, [user] ,  (err, row) => {
                if(err) {
                   console.log(err)
                }else {
                        res.status(200).send({user : username})
			res.end()
                    }
            })
        }else{
            res.status(404).send({error : "Error"})
            res.end()
        }
    }else {
        res.status(404).send({error : "Error"})
        res.end()
    }        
})



// This route is for login
app.post("/login" , (req,res) => {
    let user = req.body.user
    let password = req.body.password
	let sql = `SELECT  username, password, user_id FROM user WHERE username = ?`
        db.get(sql, [user] ,  (err, row) => {
            if(err) {
              console.log(err)
            }else if(row) {
                if (password === row.password){
                    const token = JWT.sign({user_id : row.user_id, username : row.username}, SECRET)
                    res.cookie("SSUID", token)
                    res.status(200).send({token : token})
		    res.end()
                }else {
                    res.status(404).send({error : "Check Your Password"})
                    res.end()
                }
            }else {
                res.status(404).send({error : "Check Your Credentials"})
                res.end()
            }
        })
})

// This route is for signup
app.post("/signup", (req, res) => {
    let user = req.body.user
    let password = req.body.password
    let sql = `SELECT  username, password, user_id FROM user WHERE username = ?`
        db.get(sql, [user] ,  (err, row) => {
            if(err) {
              console.log(err)
            }else if(row) {
                res.status(404).send({error : "User Exist"})
            }else {
                let sql2 = `INSERT INTO user (username, password)
                                VALUES("${user}","${password}")`
                db.run(sql2, (result, err) => {
                    if(err) {
                        res.status(404).send({error : "Internal Error"})
			res.end()
                    }else {
                        res.status(200).send({data : "User Created"})
			res.end()
                    }
                })
            }
        })

})



app.post("/newfriend",  (req,res) => {
    let token = req.body.token
    if(token) {
        let user = undefined
        try {
            user = JWT.verify(token, SECRET)
        } catch (error) {
           res.status(404).send({error : "Some Error"})
	   res.end()
        }
        if(user){
            let user_id = user.user_id
            let username = user.username
            let sql = `SELECT  username, password, user_id FROM user WHERE username = ?`
            db.get(sql, [username] , (err, row) => {
                if(err) {
                    res.status(404).send({error : "Some Error"})
                    res.end()
                }else {
                    db.all(`SELECT user_id, username FROM user`, [] , (err, row1) => {
                        if(err) {
                            console.log(err)
                        }else{
                            db.all(`SELECT friend_one, friend_two, friend_one_name, friend_two_name, status FROM newfriend`, [] , (err, row2) => {
                                if(err) {
                                    console.log(err)
                                }else {  
                                    let users = row1.filter((e) => {return e.username !== username})
                                    res.cookie("SSUID", token)
                                    res.status(200).send({user : users, friend : row2, loginId : user_id})
                                    res.end()
                                   
                                }
                                
                                
                            })  
                        }
                    })
                    
                }
            })
    
        }
        }
        
  
})







// This route is for sending Friend Request
app.post("/friend" , (req,res) => {	
    let friend_id = req.body.user_id
    let friend_two_name = ""
    let friend_one_name = ""
    let token = req.body.token
    if(token) {
        let user = undefined
        try {
            user = JWT.verify(token, SECRET) 
        } catch (error) {
            res.status(404).send({err : "error"})
            res.end()
        }
        if(user) {
            let user_id = user.user_id
         
            db.get(`SELECT username FROM user WHERE user_id == ${friend_id}`,(err, row) => {
                if(err) {
                    console.log(err)
                }else {
                    friend_two_name = row.username
                    db.get(`SELECT username FROM user WHERE user_id == ${user_id}`,(err, row) => {
                        if(err) {
                            console.log(err)
                        }else {
                            friend_one_name = row.username
                                            
                                let sql = `INSERT INTO newfriend (friend_one, friend_two, status, friend_one_name, friend_two_name)
                                VALUES("${user_id}", "${friend_id}", "${0}", "${friend_one_name}", "${friend_two_name}")`
        
                        db.run(sql, (result, err) => {
                        if(err){
                            console.log(err)
                        }else {
                            res.status(200).send({data: "ok"})
			    res.end()
                        }
                        })
                        }
                    })
                }
            })
               
        
            }
        }
        
    
})


// Getting the notification
app.post("/notification" , (req,res) => {
    let sendRequests = undefined
    let receiveRequests = undefined
    let token = req.body.token
    if(token) {
        let user = undefined
        try {
            user = JWT.verify(token, SECRET)   
        } catch (error) {
            res.status(400).send({error : "Error"})
	    res.end()    
        }
        if(user) {
            let user_id = user.user_id

            let sql1 = `SELECT * FROM newfriend WHERE friend_one = "${user_id}"` 
            let sql2 = `SELECT * FROM newfriend WHERE friend_two = "${user_id}"`
    
            db.all(sql1, (err, row1) => {
                if(err) {
                    console.log(err)
                }else{
                    sendRequests = row1
                    db.all(sql2, (err, row2) => {
                        if(err) {
                            console.log(err)
                        }else{
                            receiveRequests = row2
                            res.status(200).send({sendRequests : sendRequests, receiveRequests : receiveRequests})
                            res.end()
                        }
                    })
            
                    
                }
            })       
        } 
        }
        
})



// Giving Response to friend request
app.post("/acceptdecline" , (req,res) => {
    let accept = req.body.accept
    let decline =   req.body.decline
    let token = req.body.token
    if(token) {
        let user = undefined
        try {
             user = JWT.verify(token, SECRET) 
        } catch (error) {
            res.status(400).send({error : "Eroor"})
            res.end()
        }
        if(user){
            let user_id = user.user_id
            if(accept){
                let sql = `UPDATE newfriend 
                            SET status = "${1}"
                            WHERE friend_one == "${accept}" AND friend_two == "${user_id}"`
    
                db.run(sql, (result, err) => {
                    if(err){
                        console.log(err)
                    }else{
                     
                        res.status(200).send({data : "Ok"})
			res.end()
                    }
                })
            }
            if(decline){
                let sql = `UPDATE newfriend 
                            SET status = "${2}"
                            WHERE friend_one == "${decline}" AND friend_two == "${user_id}"`
    
                db.run(sql, (result, err) => {
                    if(err){
                        console.log(err)
                    }else{
                        
                        res.status(200).send({data : "ok"})
		        res.end()
                    }
                })
            }
    
        }
        }
        
       
})


// Getting all the friend of the corresponding user
app.post("/myfriend" , (req,res) => {
    let token = undefined
    try {
        token = req.body.token
    } catch (error) {
        token = undefined
    }
    if(token){
        let user = undefined
        try {
             user = JWT.verify(token, SECRET) 
        } catch (error) {
            res.status(404).send({error : "Error"})
            res.end()
        }
        if(user){
            let user = JWT.verify(token, SECRET)
            let user_id = user.user_id
            let username = user.username
            let sql = `SELECT  username, password, user_id FROM user WHERE username = ?`
            db.get(sql, [username] ,  (err, row) => {
                if(err) {
                  res.status(404).send({error : "Error"})
                  res.end()
                }else {
                    let sql2 =  `SELECT friend_two_name from newfriend WHERE friend_one == "${user_id}" AND status == "${1}"`
                    db.all(sql2, [] , (err, row) => {
                        if(err){
                            console.log(err)
                        }else {
                           
                            let sql2 =  `SELECT friend_one_name from newfriend WHERE friend_two == "${user_id}" AND status == "${1}"`
                            db.all(sql2, [] , (err, row2) => {
				if(err) {
				 console.log(err)	
				}else{
				
					let result = []
					row.forEach((e) => {
						result.push(e)
					})
					row2.forEach((e) => {
						result.push(e)
					})
				 	res.status(200).send( {friend : result})
		            res.end()
				}
			    })
			   
                        }
                    })   
                }
            })
    
        }else {
            res.status(404).send({error : "Internal err"})
            res.end()
        }
        }
      
})


if(process.env.NODE_ENV === 'production'){

    app.use(express.static('client/build'))

    app.get('*' , (req,res)=>{
        res.sendFile(path.resolve(__dirname,'client','build','index.html'))
    })


}



app.listen(PORT, () => {
    console.log("Server Started")
})