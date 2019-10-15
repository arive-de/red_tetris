const mongoose = require('mongoose');
const User = require('./models/User')

export function initDb() {

  mongoose.connect('mongodb://localhost:27017/redtetris', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(
       () => {
         console.log('Database is connected');
         User.collection.drop().then(() => {
           User.create([{
             username: 'mama',
           },
           {
             username: 'alix',
           }])
            .then(() => {
              console.log('users created')
            })
            .catch(err => {
              console.log(err)
            })
         })
       },
        err => {
          console.log(`Can not connect to the database ${err}`);
        }
    );
}
