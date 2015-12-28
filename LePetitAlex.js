Schemas = {};

Schemas.Foodstuff = new SimpleSchema({
  description: {
    type: String,
    autoValue: function() {
      return this.value.charAt(0).toUpperCase() + this.value.slice(1);
    }
  },
  fat:         { type: Number, label: "Fat (%m)",              min: 0, max: 100 },
  netcarb:     { type: Number, label: "Net Carbohydrate (%m)", min: 0, max: 100 },
  protein:     { type: Number, label: "Protein (%m)",          min: 0, max: 100 }
});

Schemas.Food = new SimpleSchema({
  foodStuffId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    autoform: {
        type: "select",
        options: function () {
            return Foodstuffs.find().map(function (c) {
                return {label: c.description, value: c._id};
            });
        }
    }
  },
  quantity: { type: Number, label: "Quantity (g)" }
});

Schemas.Recipe = new SimpleSchema({
  description: { type: String },
  //foods:       { type: [Schemas.Food] }
});

Schemas.Event = new SimpleSchema({
  time: {
    type: Date,
    defaultValue: moment().format('DD/MM/YYYY H:mm:ss'),
    autoform: {
      afFieldInput: {
        type: "datetime-local"
      }
    }
  },
  foods: {
    type: [Schemas.Food],
    defaultValue: []
  }
});

Foodstuffs = new Mongo.Collection("foodstuffs");
FoodstuffIndex = new EasySearch.Index({
    collection: Foodstuffs,
    fields: ['description'],
    engine: new EasySearch.MongoDB({
      sort: () => ['description']
    })
  });
Foodstuffs.attachSchema(Schemas.Foodstuff);

Recipes = new Mongo.Collection("recipes");
RecipeIndex = new EasySearch.Index({
    collection: Recipes,
    fields: ['description'],
    engine: new EasySearch.MongoDB({
      sort: () => ['description']
    })
  });
Recipes.attachSchema(Schemas.Recipe);

Events = new Mongo.Collection("events");
/*EventIndex = new EasySearch.Index({
    collection: Events,
    fields: ['time'],
    engine: new EasySearch.MongoDB()
  });*/
Events.attachSchema(Schemas.Event);

Router.configure({ layoutTemplate: 'Main' });
Router.route('/', { template: 'Home' });
Router.route('Foodstuffs');
Router.route('Recipes');
Router.route('Events');

if (Meteor.isClient) {
  Meteor.subscribe('foodstuffs');
  Meteor.subscribe('events');

  Template.Main.helpers({
    activeIfTemplateIs: function (template) {
      var currentRoute = Router.current();
      return currentRoute &&
        template === currentRoute.lookupTemplate() ? 'active' : '';
    }
  });
  Template.Foodstuffs.helpers({
    foodstuffIndex: function() { return FoodstuffIndex; },
    foodstuffs: function() { return Foodstuffs.find(); },
    formId: function() { return "form-" + this.__originalId; },
    originalDoc: function() {
      return {
        _id: this.__originalId,
        description: this.description,
        fat: this.fat,
        netcarb: this.netcarb,
        protein: this.protein
      };
    }
  });
  Template.Recipes.helpers({
    recipeIndex: function() { return RecipeIndex; },
    recipes: function() { return Recipes.find(); }
  });
  Template.Events.helpers({
    eventIndex: function() { return EventIndex; },
    events: function() { return Events.find(); }
  });
  Template.AddNewEvent.helpers({
    now: function() { return new Date; }
  })
  Template.registerHelper('searchAttributes', function() {
      return { placeholder: "Search...", class: "searchBox form-control" };
  });
  Meteor.startup(() => {
    AutoForm.setDefaultTemplate('bootstrap3');
  });
}

if (Meteor.isServer) {
  Meteor.publish("foodstuffs", function () {
    return Foodstuffs.find();
  });
  Meteor.publish("events", function () {
    return Events.find();
  });
  Meteor.startup(function () {
  });
}
