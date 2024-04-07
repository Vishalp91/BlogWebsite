const express = require('express');
const app = express();
const methodOverride = require('method-override');
const { v4: uuidv4 } = require('uuid');
const mysql = require("mysql2");
const path = require('path');

const port = 8080;

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'Blog',
    password : 'veritas' 
});
  

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({extended : true}));
app.use(methodOverride("_method"));


app.get("/blogs", (req, res) => {
    let q = `select * from blogs`;
    try {
        connection.query(q, (err, result) => {
            if(err) throw err;
            console.log(result);
            let blogs = result;
            res.render("show.ejs", {blogs});
    });
    }
    catch(err) {
        console.log(err);
    }
});

app.get("/blogs/new", (req, res) => {
    res.render("new.ejs");
});

app.post("/blogs", (req, res) => {
    let id = uuidv4();
    let blog = req.body;
    let q = `insert into blogs(id, name, content, password) values (?, ?, ?, ?)`;
    try {
        connection.query(q, [id, blog.name, blog.content, blog.password], (err, result) => {
            if(err) throw err;
            res.redirect("/blogs")
        });
    }
    catch(err) {
        res.send(window.alert("Some error in the database"));
    }
});

app.get("/blogs/:id/edit", (req, res) => {
    let {id} = req.params;
    let q = `select * from blogs where id = '${id}'`;
    try {
        connection.query(q, (err, result) => {
            if(err) throw err;
            let blog = result[0];
            res.render("edit.ejs", {blog});
        });
    }
    catch(err) {
        console.log(err);
        res.send("Some error in the database");
    }
});

app.patch("/blogs/:id", (req, res) => {
    let {id} = req.params;
    let q1 = `select * from blogs where id = '${id}'`;
    let blog = req.body;
    connection.query(q1, (err, result) => {
        if(err) throw err;
        
        let pass = result[0].password;
        if(blog.password != pass) {
            res.send("Wrong Password!");
        }
        else {
            let q2 = `update blogs set content = '${blog.content}' where id = '${id}'`;
            try {
                connection.query(q2, (err, result) => {
                    console.log(result);
                    res.redirect("/blogs");
                });
            }
            catch(err) {
                console.log(err);
                res.send("Some error in the database");
            }
        }
    });
});

app.get("/blogs/:id/delete", (req, res) => {
    let {id} = req.params;
    let q = `select * from blogs where id = '${id}'`;
    try {
        connection.query(q, (err, result) => {
            if(err) throw err;
            let blog = result[0];
            res.render("delete.ejs", {blog});
        });
    }
    catch(err) {
        console.log(err);
        res.send("Some error in the database");
    }
});

app.delete("/blogs/:id", (req, res) => {
    let {id} = req.params;
    let blog = req.body;
    let q1 = `select password from blogs where id = '${id}'`;
    try {
    connection.query(q1, (err, result) => {
        if(err) throw err;

        let pass = result[0].password;
        if(blog.password != pass) {
            res.send("Wrong Password");
        }
        else {
            let q2 = `delete from blogs where id = '${id}'`;
            try {
                connection.query(q2, (err, result) => {
                    if(err) throw err;

                    res.redirect("/blogs");
                });
            }
            catch(err) {
                res.send("Some error in the database");
            }
        }
    });
    }
    catch(err) {
        console.log(err);
        res.send("Some error in the database");
    }
});

app.get("/blogs/:id/likes", (req, res) => {
    let {id} = req.params;
    let q = `select likes from blogs where id = '${id}'`;
    try {
        connection.query(q, (err, result) => {
            if(err) throw err;
            let like = result[0].likes + 1;
            let q2 = `update blogs set likes = '${like}' where id = '${id}'`;
            try {
                connection.query(q2, (err, result) => {
                    if(err) throw err;
                    res.redirect("/blogs");
                });
            }
            catch(err) {
                res.send("Some error in the database");
            }
        });
    }
    catch(err) {
        res.send("Some error in the database");
    }
});

app.listen(port, () => {
    console.log(`Server is listening on port : ${port}`);
});