const express=require("express");
const app=express();
var path = require('path');
const { exec }=require("child_process");
const bodyParser = require('body-parser');
var ip = require('ip');
 

app.set("view engine","pug")
app.set("views","./views")

app
    .use(bodyParser.json({ limit: '50mb', extended: true }))
    .use(bodyParser.urlencoded({ limit: '50mb', extended: true }))

app.use(express.static(path.join(__dirname, 'asset')));

var server = app.listen(3000);

app.get("/",(req,res)=>{  
    
    exec(`sudo docker ps -a --format '{ "Name": "{{.Names}}","Network": "{{ .Networks}}","Status": "{{.Status}}","Command": {{.Command}},"Size": "{{.Size}}","Ports": "{{.Ports}}","Mounts": "{{.Mounts}}"},'`,(err,stdout,stdin)=>{
        if(err){
            console.log(err)
        }
        stdout+="{}"
        stdout="["+stdout+"]";
        res.render("index",{
            ps: encodeURI(stdout),
            ip: ip.address()
        })
        console.log(stdin);
    })
})

app.post("/addInstance",(req,res)=>{  
    let name=req.body.data[0].name == ""? "":"--name "+req.body.data[0].name;
    let network=req.body.data[0].network == ""? "":"--network "+req.body.data[0].network;
    let port=req.body.data[0].port == ""? " ":"-p "+req.body.data[0].port+":4200";
    let cmd=`sudo docker run -dit ${port} ${name} ${network} clinode`;
    exec(cmd,(err,stdout,stdin)=>{
        if(err){
            console.log(err)
            res.json({
                msg: err,
                status: false
            })
        }
        else{
            res.json({
                msg: "New Node up.",
                status: true
            })
        }
        
        console.log(stdin);
    })
})

app.post("/toggle",(req,res)=>{  
    let name=req.body.data[0].name
    let state=req.body.data[0].state
    let cmd=`sudo docker ${state} ${name}`;
    exec(cmd,(err,stdout,stdin)=>{
        if(err){
            console.log(err)
            res.json({
                msg: err,
                status: false
            })
        }
        else{
            res.json({
                status: true
            })
        }
    })
})

