//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose=require("mongoose");
const _=require("lodash")
const app = express();
//Connection
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
mongoose.connect("mongodb+srv://admin-peter:Test123@cluster0.s3uv5.mongodb.net/todoListDb",{useNewUrlParser:true});
//Schema
const itemSchema=mongoose.Schema({
  name:String,
})

const listSchema=mongoose.Schema({
  name:String,
  item:[itemSchema]
})
//Items
const Item=mongoose.model("item",itemSchema);
const List=mongoose.model("List",listSchema)

const item1=new Item({
  name:"item 1 added welcome"
});
const item2=new Item({
  name:"Hit this button to pause"
});
const item3=new Item({
  name:"Stop this to item"
});
const defaultItem=[item1,item2,item3];

app.get("/", function(req, res) {

  Item.find({},(err,foundItem)=>{
    if(foundItem.length===0){
      Item.insertMany(defaultItem,(err)=>{
        if(err){
          console.log(err);
        }
        else{
          console.log("Successfully added to database");
        }
      })
      res.redirect("/");
    }
    else{
      res.render("list", {listTitle: "Today", newListItems: foundItem});
    }

  })
});

app.get("/:customListName",(req,res)=>{
  const customListName=_.capitalize(req.params.customListName);

  List.findOne({name:customListName},(err,foundlist)=>{
    if(!err){
      if(!foundlist){
        const list=new List({
          name:customListName,
          item:defaultItem
        });
        list.save();
        res.redirect("/"+customListName)

      }
      else{
        //show Collections
        res.render("list",{listTitle: foundlist.name, newListItems: foundlist.item})
        
      }
    }
  })

})

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listTitleName=req.body.list;
  const item=new Item({
    name:itemName,
  })
  if(listTitleName==="Today"){
    item.save();
    res.redirect("/")
  }else{
    List.findOne({name:listTitleName},(err,foundList)=>{
      foundList.item.push(item);
      foundList.save();
      res.redirect("/"+listTitleName)
    })
  }

});
app.post("/delete",(req,res)=>{

  const itemId=req.body.checkbox;
  const listName=req.body.listName;
  if (listName==="Today"){
    Item.findByIdAndRemove(itemId,(err)=>{
      if(err){
        console.log(err);
      }
      else{
        console.log("Successfully deleted");
      }
    })
    res.redirect("/")
  }
  else{
    List.findOneAndUpdate({name:listName},{$pull:{item: {_id:itemId}}},(err,foundList)=>{
      if (!err) {
        res.redirect("/"+listName)
      };
    });
  }

})



// app.get("/about", function(req, res){
//   res.render("about");
// });



app.listen(3000, function() {
  console.log("Server started on port 3000");
});
