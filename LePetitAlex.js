Schemas = {};

Schemas.Foodstuff = new SimpleSchema({
  description: {
    type: String
  },
  fat: {
    type: Number,
    label: "Fat (%m)",
    min: 0,
    max: 100
  },
  netcarb: {
    type: Number,
    label: "Net Carbohydrate (%m)",
    min: 0,
    max: 100
  },
  protein: {
    type: Number,
    label: "Protein (%m)",
    min: 0,
    max: 100
  }
});

Schemas.Food = new SimpleSchema({
  foodStuffId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id
  },
  quantity: {
    type: Number,
    label: "Quantity (g)"
  }
});

Schemas.Event = new SimpleSchema({
  time: {
    type: Date,
    defaultValue: moment().format('DD/MM/YYYY H:mm'),
    autoform: {
      afFieldInput: {
        type: "datetime-local"
      }
    }
  }/*,
  foods: {
    type: [Schemas.Food],
    defaultValue: []
  }*/
});

Foodstuffs = new Mongo.Collection("foodstuffs");
FoodstuffIndex = new EasySearch.Index({
    collection: Foodstuffs,
    fields: ['description'],
    engine: new EasySearch.MongoDB()
  });
Foodstuffs.attachSchema(Schemas.Foodstuff);

Events = new Mongo.Collection("events");
EventIndex = new EasySearch.Index({
    collection: Events,
    fields: ['time'],
    engine: new EasySearch.MongoDB()
  });
Events.attachSchema(Schemas.Event);

Router.configure({
    layoutTemplate: 'Main'
});

Router.route('/', { template: 'Home' });
Router.route('Foodstuffs');
Router.route('Events');

if (Meteor.isClient) {
  Template.Main.helpers({
    activeIfTemplateIs: function (template) {
      var currentRoute = Router.current();
      return currentRoute &&
        template === currentRoute.lookupTemplate() ? 'active' : '';
    }
  });
  Template.Foodstuffs.helpers({
    foodstuffIndex: function() {
      return FoodstuffIndex;
    },
    foodstuffs: function() {
      return Foodstuffs.find();
    },
    searchAttributes: function() {
      return { placeholder: "Search...", class: "searchBox form-control" };
    }
  });
  Template.Events.helpers({
    eventIndex: function() {
      return EventIndex;
    },
    events: function() {
      return Events.find();
    },
    searchAttributes: function() {
      return { placeholder: "Search...", class: "searchBox form-control" };
    }
  });
  Meteor.startup(() => {
    AutoForm.setDefaultTemplate('bootstrap3');
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
  });
}
