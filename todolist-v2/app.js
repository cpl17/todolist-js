//jshint esversion:6
const express = require("express");
const bodyParser = require("body-parser");
// const date = require(__dirname + "/date.js")
const { default: mongoose } = require("mongoose");
const _ = require("lodash")

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://youngchuck:%4013579Char@cluster0.bkhiq.mongodb.net/toDoListDB")


//Object Models

const itemsSchema = {
  name: {
    type: String,
    required: true
  }
}
const Item = mongoose.model("Item",itemsSchema);



const listSchema = {
  name: String,
  items: [itemsSchema]
}
const List = mongoose.model("List",listSchema)



//Default Items

var defaultItems = [{name: "Walk Dog"},{name: "Drink Water"}, {name: "Exercise"}]


//Home Route

app.get("/", function(req, res) {

  
  //Get any ToDo Items in the db
  Item.find({},(err,foundItems)=>{

    if (foundItems.length ===0){

      Item.insertMany(defaultItems, (err,docs)=>{
        if (err){
          console.log(err);
        }
        else {
          console.log("Success");
        }
      });

      res.redirect("/")

    } else {
      res.render("list", {listTitle: "Today", newListItems: foundItems})
    }
  }).clone().catch(err=>console.log(err))
});

//Update the db with new items
app.post("/", function(req, res){

  //Submit names is lists.ejs
  const itemName = req.body.newItem;
  const listName = req.body.list; 

  const item = new Item({name:itemName})

  if (listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({name:listName},(err,foundList)=>{
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName)
    })
  }

});


app.get("/about", function(req, res){
  res.render("about");
});

app.post("/delete",(req,res)=>{
  
  const checkeditemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {

    Item.findByIdAndRemove({_id:checkeditemId},(err)=>{
      if (err){
        console.log("Successfully deleted")
      }
    })
    res.redirect("/")
  } else {

    List.findOneAndUpdate(
      {name:listName},
      {$pull:{items:{_id: checkeditemId}}}, 
      (err,foundList)=> {
        if (!err){
          res.redirect("/" + listName)
        }
        else {console.log(err)}
      })
  }
})

app.get("/:Name",(req,res)=>{
  const customListName = _.capitalize(req.params.Name)

  const list = new List({
    name: customListName,
    items: defaultItems
  })

  List.findOne({name:customListName},(err,foundList)=>{
    if (!err){
      if(!foundList){

        //Create New List
        const list = new List({
          name: customListName,
          items: defaultItems
        })

        list.save()

        res.redirect("/" + customListName)
      }
      else {
        
        // Show existing list
        res.render("list",{listTitle: foundList.name, newListItems: foundList.items})
      }
    }
  })
}); 


app.listen(3000, function() {
  console.log("Server started on port 3000");
});
